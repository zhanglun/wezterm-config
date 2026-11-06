#!/usr/bin/env python3
"""Convert a pixel-grid PNG into office-2 art.js rect arrays.

Input must be an integer-pixel sprite: one PNG pixel is one art unit. Scale the
reference image down first (nearest neighbour, no smoothing) if it is not.

    python3 herdr/tools/png2rects.py sprite.png --width 16 --height 30
    python3 herdr/tools/png2rects.py sprite.png --emit STAND.body --name hiStandBody

Output format matches herdr/mods/office-2/art.js:

    [x, y, w, h, "color"]

`y` counts up from the sprite's bottom row, so the feet land on y = 0 and the
values are negative, exactly like the hand-written arrays.
"""
import argparse
import json
import struct
import sys
import zlib

# Palette keys already present in art.js. Colors outside the palette are emitted
# as "#rrggbb" / "#rrggbbaa" literals, which rects() already accepts.
PALETTE = {
    "#ffffff": "collar",
    "#2a2420": "shoe",
    "#1d1d24": "eye",
    "#3a2c22": "belt",
}


def read_png(path):
    """Decode a non-interlaced PNG to (width, height, rows of RGBA tuples)."""
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"{path}: not a PNG file")

    pos = 8
    header = None
    palette = None
    trns = None
    idat = b""
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos:pos + 4])
        ctype = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            header = struct.unpack(">IIBBBBB", body)
        elif ctype == b"PLTE":
            palette = [tuple(body[i:i + 3]) for i in range(0, len(body), 3)]
        elif ctype == b"tRNS":
            trns = body
        elif ctype == b"IDAT":
            idat += body
        elif ctype == b"IEND":
            break

    if header is None:
        raise SystemExit(f"{path}: missing IHDR")
    width, height, depth, color, comp, filt, interlace = header
    if depth != 8:
        raise SystemExit(f"{path}: only 8-bit channels supported (got {depth})")
    if interlace:
        raise SystemExit(f"{path}: interlaced PNGs are not supported")
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(color)
    if channels is None:
        raise SystemExit(f"{path}: unsupported color type {color}")

    raw = zlib.decompress(idat)
    stride = width * channels
    rows = []
    prev = bytearray(stride)
    at = 0
    for _ in range(height):
        ftype = raw[at]
        at += 1
        line = bytearray(raw[at:at + stride])
        at += stride
        if ftype == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 255
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif ftype == 3:
            for i in range(stride):
                left = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 255
        elif ftype == 4:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 255
        elif ftype != 0:
            raise SystemExit(f"{path}: unknown filter {ftype}")
        prev = line

        out = []
        for x in range(width):
            px = line[x * channels:(x + 1) * channels]
            if color == 0:
                out.append((px[0], px[0], px[0], 255))
            elif color == 2:
                out.append((px[0], px[1], px[2], 255))
            elif color == 3:
                idx = px[0]
                if palette is None or idx >= len(palette):
                    raise SystemExit(f"{path}: palette index {idx} out of range")
                r, g, b = palette[idx]
                a = trns[idx] if trns and idx < len(trns) else 255
                out.append((r, g, b, a))
            elif color == 4:
                out.append((px[0], px[0], px[0], px[1]))
            else:
                out.append((px[0], px[1], px[2], px[3]))
        rows.append(out)
    return width, height, rows


def nearest_resample(rows, width, height, tw, th):
    """Nearest-neighbour resample. No blending: mixing colours is what makes
    downsized pixel art look muddy, and every output pixel must be a real source
    colour so it can map back to the palette."""
    out = []
    for ty in range(th):
        sy = min(height - 1, ty * height // th)
        src = rows[sy]
        out.append([src[min(width - 1, tx * width // tw)] for tx in range(tw)])
    return out


def fit_box(width, height, tw, th, mode):
    """Return the crop box honouring the target aspect ratio in `contain` mode."""
    if mode == "stretch":
        return 0, 0, width, height
    want = tw / th
    have = width / height
    if have > want:  # too wide: trim the sides
        cw = max(1, round(height * want))
        x0 = (width - cw) // 2
        return x0, 0, cw, height
    ch = max(1, round(width / want))  # too tall: trim top and bottom
    y0 = (height - ch) // 2
    return 0, y0, width, ch


def collapse_palette(rows, width, height, keep):
    """Reduce to at most `keep` colours by frequency, remapping the rest to the
    nearest kept colour. Least-squares distance in RGB, deterministic on ties."""
    counts = {}
    for y in range(height):
        for x in range(width):
            px = rows[y][x]
            if px[3] < 8:
                continue
            counts[px[:3]] = counts.get(px[:3], 0) + 1
    if len(counts) <= keep:
        return rows, sorted(counts)

    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    kept = [c for c, _ in ranked[:keep]]
    cache = {}
    for y in range(height):
        for x in range(width):
            px = rows[y][x]
            if px[3] < 8:
                continue
            src = px[:3]
            if src in cache:
                rows[y][x] = cache[src]
                continue
            best, bd = kept[0], None
            for k in kept:
                d = (k[0] - src[0]) ** 2 + (k[1] - src[1]) ** 2 + (k[2] - src[2]) ** 2
                if bd is None or d < bd:
                    best, bd = k, d
            cache[src] = best + (px[3],)
            rows[y][x] = cache[src]
    return rows, kept


def sprite_report(rows, width, height):
    """Judge whether an image behaves like pixel art: few colours, large same-colour
    blocks, a real outline. Hand-drawn illustration is what fails this test."""
    counts = {}
    opaque = 0
    for y in range(height):
        for x in range(width):
            px = rows[y][x]
            if px[3] < 8:
                continue
            counts[px[:3]] = counts.get(px[:3], 0) + 1
            opaque += 1
    if not opaque:
        return None

    runs = []
    for y in range(height):
        x = 0
        while x < width:
            c = rows[y][x]
            n = 1
            while x + n < width and rows[y][x + n] == c:
                n += 1
            runs.append(n)
            x += n
    avg_run = sum(runs) / len(runs)

    # A pixel-art sprite has an outline: a dark ring around a lighter interior.
    lum = lambda px: (px[0] * 3 + px[1] * 6 + px[2]) // 10
    edge = inner = edge_n = inner_n = 0
    dark = 0
    for y in range(height):
        for x in range(width):
            px = rows[y][x]
            if px[3] < 8:
                continue
            if lum(px) < 70:
                dark += 1
            nb = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            if any(not (0 <= nx < width and 0 <= ny < height) or rows[ny][nx][3] < 8 for nx, ny in nb):
                edge += lum(px)
                edge_n += 1
            else:
                inner += lum(px)
                inner_n += 1
    contrast = (inner / inner_n) - (edge / edge_n) if edge_n and inner_n else 0
    return {
        "size": (width, height),
        "opaque": opaque,
        "colours": len(counts),
        "avg_run": avg_run,
        "dark_pct": 100 * dark / opaque,
        "edge_contrast": contrast,
    }


def print_report(rep, label="source"):
    if rep is None:
        print(f"{label}: fully transparent", file=sys.stderr)
        return
    w, h = rep["size"]
    verdict, why = [], []
    if rep["colours"] <= 24:
        verdict.append("ok")
    else:
        why.append(f"{rep['colours']} colours (pixel art uses ≤24)")
    if rep["avg_run"] >= 2.0:
        verdict.append("ok")
    else:
        why.append(f"avg run {rep['avg_run']:.2f}px (blocks are pixel-sized, so nothing survives a resize)")
    if rep["dark_pct"] >= 4:
        verdict.append("ok")
    else:
        why.append(f"only {rep['dark_pct']:.1f}% dark pixels (no outline)")
    if rep["edge_contrast"] >= 15:
        verdict.append("ok")
    else:
        why.append(f"edge contrast {rep['edge_contrast']:.0f} (no outline separation)")

    print(f"{label}: {w}x{h}, {rep['opaque']} opaque px", file=sys.stderr)
    print(f"  colours      {rep['colours']}", file=sys.stderr)
    print(f"  avg run      {rep['avg_run']:.2f}px", file=sys.stderr)
    print(f"  dark pixels  {rep['dark_pct']:.1f}%", file=sys.stderr)
    print(f"  edge contrast {rep['edge_contrast']:.0f}", file=sys.stderr)
    if not why:
        print("  verdict: looks like pixel art, good sprite source", file=sys.stderr)
    elif len(why) == 1:
        print(f"  verdict: usable with care - {why[0]}", file=sys.stderr)
    else:
        print("  verdict: NOT a sprite source", file=sys.stderr)
        for w_ in why:
            print(f"    - {w_}", file=sys.stderr)


def to_key(rgba):
    r, g, b, a = rgba
    if a < 8:
        return None  # transparent
    hexv = "#{:02x}{:02x}{:02x}".format(r, g, b)
    return PALETTE.get(hexv, hexv)


def greedy_rects(rows, width, height):
    """Merge equal-colour pixels into horizontal runs, then stack equal runs."""
    grid = [[to_key(rows[y][x]) for x in range(width)] for y in range(height)]
    taken = [[False] * width for _ in range(height)]
    rects = []
    for y in range(height):
        for x in range(width):
            key = grid[y][x]
            if key is None or taken[y][x]:
                continue
            w = 1
            while x + w < width and grid[y][x + w] == key and not taken[y][x + w]:
                w += 1
            h = 1
            while y + h < height:
                row = grid[y + h]
                if all(row[x + k] == key and not taken[y + h][x + k] for k in range(w)):
                    h += 1
                else:
                    break
            for j in range(y, y + h):
                for i in range(x, x + w):
                    taken[j][i] = True
            # y counts up from the bottom row, so the sprite's feet sit on y = 0.
            rects.append([x, -(height - y), w, h, key])
    return rects


def render(rects, width, height):
    """Rasterise the rect list back to a grid, for the self-check."""
    grid = [[None] * width for _ in range(height)]
    for x, y, w, h, key in rects:
        top = height + y
        for j in range(top, top + h):
            for i in range(x, x + w):
                if not (0 <= i < width and 0 <= j < height):
                    raise SystemExit(f"rect {[x, y, w, h]} falls outside the sprite")
                if grid[j][i] is not None:
                    raise SystemExit(f"rect {[x, y, w, h]} overlaps another rect")
                grid[j][i] = key
    return grid


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("png", nargs="?", help="pixel-grid PNG, one pixel per art unit")
    ap.add_argument("--width", type=int, help="crop to this width (default: whole image)")
    ap.add_argument("--height", type=int, help="crop to this height (default: whole image)")
    ap.add_argument("--flip-x", action="store_true", help="mirror horizontally (the sprite faces left)")
    ap.add_argument("--scale-to", metavar="WxH", help="nearest-neighbour resample to this size, e.g. 16x30")
    ap.add_argument("--fit", choices=["contain", "stretch"], default="contain",
                    help="contain keeps the aspect ratio by cropping; stretch distorts (default: contain)")
    ap.add_argument("--palette", type=int, metavar="N", help="collapse to at most N colours")
    ap.add_argument("--trim", action="store_true", help="crop to the opaque bounding box first")
    ap.add_argument("--stats", action="store_true", help="report whether the image is usable pixel art")
    ap.add_argument("--name", default="sprite", help="variable name in the generated snippet")
    ap.add_argument("--emit", default=None, help="comment the target array, e.g. STAND.body")
    ap.add_argument("--json", action="store_true", help="print JSON instead of JS")
    ap.add_argument("--raw", action="store_true", help="print one rect per line")
    ap.add_argument("--self-check", action="store_true", help="verify the rects reproduce the image")
    args = ap.parse_args()

    if not args.png:
        # No file: prove the merge and the self-check work on a tiny built image.
        rows = [
            [(0, 0, 0, 0), (255, 255, 255, 255), (255, 255, 255, 255)],
            [(0, 0, 0, 0), (255, 255, 255, 255), (0, 0, 0, 0)],
            [(42, 36, 32, 255), (42, 36, 32, 255), (42, 36, 32, 255)],
        ]
        width, height = 3, 3
        print("no PNG given: running the built-in self-check", file=sys.stderr)
    else:
        width, height, rows = read_png(args.png)
        cw = args.width or width
        ch = args.height or height
        if cw > width or ch > height:
            raise SystemExit(f"{args.png}: image is {width}x{height}, cannot crop to {cw}x{ch}")
        rows = [r[:cw] for r in rows[:ch]]
        width, height = cw, ch

        if args.trim:
            xs, ys = [], []
            for y in range(height):
                for x in range(width):
                    if rows[y][x][3] >= 8:
                        xs.append(x)
                        ys.append(y)
            if not xs:
                raise SystemExit(f"{args.png}: image is fully transparent")
            x0, y0 = min(xs), min(ys)
            rows = [r[x0:max(xs) + 1] for r in rows[y0:max(ys) + 1]]
            width, height = max(xs) - x0 + 1, max(ys) - y0 + 1
            print(f"trimmed to {width}x{height}", file=sys.stderr)

        if args.scale_to:
            try:
                tw, th = (int(v) for v in args.scale_to.lower().split("x"))
            except ValueError:
                raise SystemExit("--scale-to expects WxH, e.g. 16x30")
            bx, by, bw, bh = fit_box(width, height, tw, th, args.fit)
            if (bw, bh) != (width, height):
                print(f"fit {args.fit}: cropping {width}x{height} to {bw}x{bh}", file=sys.stderr)
                rows = [r[bx:bx + bw] for r in rows[by:by + bh]]
            rows = nearest_resample(rows, bw, bh, tw, th)
            width, height = tw, th
            print(f"resampled to {width}x{height}", file=sys.stderr)

        if args.palette:
            rows, kept = collapse_palette(rows, width, height, args.palette)
            print(f"palette collapsed to {len(kept)} colours", file=sys.stderr)

        if args.flip_x:
            rows = [list(reversed(r)) for r in rows]

    if args.stats:
        print_report(sprite_report(rows, width, height),
                     label=args.png or "built-in sample")

    rects = greedy_rects(rows, width, height)
    if args.self_check or args.png is None:
        expected = [[to_key(rows[y][x]) for x in range(width)] for y in range(height)]
        got = render(rects, width, height)
        assert got == expected, "self-check failed: rects do not reproduce the image"
        print(f"self-check passed: {width}x{height}, {len(rects)} rects", file=sys.stderr)

    if args.json:
        print(json.dumps(rects))
        return

    body = []
    for x, y, w, h, key in rects:
        color = f'"{key}"'
        body.append(f"  [{x}, {y}, {w}, {h}, {color}],")
    if args.raw:
        print("\n".join(body))
        return

    target = f"  // target: {args.emit}\n" if args.emit else ""
    print(f"const {args.name} = [\n" + "\n".join(body) + "\n];")
    if target:
        print(target)


if __name__ == "__main__":
    main()
