# Herdr office-2

This directory contains the maintained `office-2` Herdr layout and mod. It is separate from the WezTerm Lua configuration and can be installed on another machine without replacing unrelated Herdr settings.

## What it is

`office-2` is a native Herdr/GPUI mod:

- JavaScript describes `div()` elements and pixel rectangles.
- Herdr renders those elements with GPUI/Rust; there is no HTML, CSS, browser view, Canvas, or third-party tile engine.
- `main.js` owns the live office view, agent states, time/weather polling, layout, and animation composition.
- `art.js` is the stable art API. Its domain files live under `mods/office-2/art/`: `people.js`, `palette.js`, `furniture.js`, `props.js`, `cat.js`, and `render.js`.
- `decor.js` is the stable decor API. Its domain files live under `mods/office-2/decor/`: `windows.js`, `room.js`, `widgets.js`, and `seasonal.js`.
- Weather uses one IP geolocation request and Open-Meteo current/daily data. Failures are silent.
- `icons/` contains the CC0 weather PNGs and their license notice.
- `spaces-tabs` (a clone of Herdr's `spaces` mod) draws the sidebar in two even
  halves: every space on top, and under it the tabs of the active space, one row
  each, with a `+` that opens a new tab in that space. Herdr's top tab bar is not
  in this layout.
- `panel-buttons` draws the sidebar's Files/Changes row and keeps the per-space
  panel memory that used to live in Herdr's `tabs` mod.

## Install on another computer

Requirements:

1. Install/open Herdr so `herdr-app` is available.
2. Install this repository.
3. Run:

```sh
./herdr/install-office-2.sh
```

The script copies only:

- `herdr/layouts/office-2.json`
- `herdr/layouts/office-2.svg`
- `herdr/mods/office-2/`
- `herdr/mods/spaces-tabs/`
- `herdr/mods/panel-buttons/`

It does not replace `settings.json`, `keys.json`, spaces, tabs, or the existing `office` layout.

`HERDR_APP_HOME` can be set when Herdr uses a non-default config root:

```sh
HERDR_APP_HOME="$HOME/.config/herdr-app" ./herdr/install-office-2.sh
```

## Draw a sprite and turn it into art.js data

`art.js` sprites are flat lists of `[x, y, w, h, color]` rects, `y` counting up
from the floor line. `tools/png2rects.py` converts a pixel-grid PNG into that
format so coordinates do not have to be typed by hand.

Draw the sprite first in a pixel editor (Piskel, Lospec Pixel Editor, Aseprite,
Pixelorama). One PNG pixel must equal one art unit, so scale the reference down
with nearest-neighbour first. Use the same box as the array you are replacing:
`16x30` for `STAND`/`SIT` parts.

```sh
# Whole 16x30 image, printed as a JS snippet for STAND.body
python3 herdr/tools/png2rects.py sprite.png --width 16 --height 30 --emit STAND.body

# Mirror a left-facing drawing, verify the rects reproduce the image
python3 herdr/tools/png2rects.py sprite.png --flip-x --self-check

# JSON, for scripted use
python3 herdr/tools/png2rects.py sprite.png --json

# No file: run the built-in self-check
python3 herdr/tools/png2rects.py
```

Notes:

- Transparent pixels are skipped, so the rect list carries no background.
- Colors already in `art.js` map to palette keys (`eye`, `shoe`, `collar`,
  `belt`); anything else is emitted as a `"#rrggbb"` literal, which `rects()`
  accepts. Rename those to palette keys by hand if you want shading variants.
- Equal-colour runs are merged, so a flat fill becomes one rect instead of
  hundreds of 1x1s.
- Use RGBA or indexed PNGs. A 24-bit RGB file has no transparency and its
  background becomes real pixels.
- Only 8-bit, non-interlaced PNGs are read. Run `--self-check` when in doubt: it
  rasterises the rects back and compares them to the source pixels.

The script runs `herdr-app check` and switches to `office-2` after installation.

### Developing on this machine

Default copy mode keeps Herdr's hot reload working: edit the files under `herdr/mods/office-2/`, re-run the script, and the running window picks the change up within a second. See `mods/office-2/STRUCTURE.md` for which file to edit. One command:

```sh
./herdr/install-office-2.sh && herdr-app shot /tmp/office.png
```

## Preview the art in a separate window

This is the standard loop for testing art/decor UI work: the gallery shows
every sprite, palette and decor widget from the same source files, in its own
window, so experiments never touch the daily layout.

`install-office-preview.sh` installs the `office-preview` gallery mod and
layout into the daily Herdr home **without touching the daily layout**. To
see it inside the daily window, switch manually
(`herdr-app do layout.switch --name office-preview`; that layout has no
sidebar or terminals — switch back with `--name office-2`). To browse the
gallery without touching the daily window at all, run:

```sh
./herdr/preview-window.sh
```

This opens a second Herdr window from an isolated config home
(`~/.config/herdr-preview`, override with `HERDR_PREVIEW_HOME`): the live
office strip on top, the "Office-2 native preview" gallery below. The daily
window keeps its own layout the whole time; both windows share the same
terminals and agents (herdr-core), so the live strip shows real agents.

A full edit-test cycle:

```sh
# 1. edit art/ or decor/ under herdr/mods/office-2/, then refresh the gallery
./herdr/preview-window.sh          # re-copies mods, hot-reloads, raises the window

# 2. screenshot the preview window alone (never the daily one)
HERDR_APP_HOME="$HOME/.config/herdr-preview" herdr-app shot /tmp/preview.png

# 3. sanity-check the mod still loads
HERDR_APP_HOME="$HOME/.config/herdr-preview" herdr-app check "$HOME/.config/herdr-preview/mods/office-preview"
```

`HERDR_APP_HOME` picks which running window the CLI talks to, so the shot and
check commands above cannot disturb the daily window. Close the preview
window like any window; the daily window is unaffected.

Note: the examples call `herdr-app`. If it is not on your PATH, alias the app
binary first (`alias herdr-app="$HOME/Applications/Herdr.app/Contents/MacOS/Herdr"`
on this machine); the install scripts fall back to that path themselves.

### Symlink mode (opt-in)

`./herdr/install-office-2.sh --link` points Herdr at this repo with symlinks instead of copying. Reading and rendering work, but Herdr's file watcher does not follow symlinked targets, so mod/layout edits are not hot-reloaded and need an app restart to apply. Use it only when you prefer the repo as the single source and accept restarting Herdr after edits.

## Update later

On the other machine:

```sh
git pull
./herdr/install-office-2.sh
```

If the target machine has a different Herdr version, run the check first. The mod's generated `gpui-kit.d.ts` and `jsconfig.json` are intentionally not copied: Herdr owns those files and rewrites them for the local runtime.

## Keep `office` and `office-2` separate

The original `office` layout is not modified. `office-2` is the maintained version and is selected explicitly by the installer or:

```sh
herdr-app do layout.switch --name office-2
```
