// The room's fixtures: wall pieces, the door, weather in the windows, seasonal touches.
// Each function returns elements positioned in the scene's px.
import { div, image } from "gpui-kit";
import { run } from "herdr";
import * as A from "./art.js";
import { renderPart } from "./sprite.js";

const WOOD = "#7a5c3e";
const INK = "#3b3b44";

export function glassWall(x, w, h, sky, weather) {
  const FRAME = "#9aa2ab", SILL = "#767e86";
  const stormy = weather === "rain" || weather === "storm" || weather === "drizzle";
  const dayish = !sky.stars && (weather === "clear" || weather === "partly" || weather === "clouds" || !weather);
  const hour = sky.hour ?? 12;
  const night = Boolean(sky.stars);
  const late = night || hour >= 18 || hour < 7; // silhouette + lit windows after dusk
  const cols = Math.max(4, Math.round(w / 168));
  const colW = w / cols;
  const transom = Math.round(h * 0.3);
  const n = (k, span) => 18 + ((k * 137) % Math.max(1, span));
  const stars = night && weather !== "fog"
    ? Array.from({ length: Math.min(20, Math.floor(w / 72)) }, (_, k) =>
      div().absolute().left(n(k, w - 36)).top(8 + ((k * 53) % Math.max(12, transom - 14))).size(2).bg("#fff7d6")
        .loop("opacity", { from: 0.3, to: 1, period: 1600 + k * 90 }))
    : [];
  // Sun arcs left→right from 7:00 to 17:00; the moon drifts through the night.
  const sunT = Math.max(0, Math.min(1, (hour - 7) / 10));
  const sunX = Math.round(w * (0.1 + sunT * 0.76));
  const sunY = Math.round(10 + Math.pow(Math.abs(sunT - 0.45) / 0.55, 2) * (transom + 22));
  const warm = Boolean(sky.golden);
  const moonX = Math.round(w * (0.24 + (((hour >= 21 ? hour - 21 : hour + 3) % 8) / 8) * 0.45));
  const cel = night
    ? [div().absolute().left(moonX - 8).top(4).size(38).rounded_full().bg("#f1ecd2").opacity(0.14),
       div().absolute().left(moonX).top(12).size(22).rounded_full().bg("#f1ecd2")]
    : dayish && hour < 20 && hour >= 5
      ? [div().absolute().left(sunX - (sky.golden ? 14 : 8)).top(sunY - (sky.golden ? 12 : 6)).size(sky.golden ? 56 : 40)
        .rounded_full().bg(warm ? "#ffbd6b" : "#ffe28a").opacity(sky.golden ? 0.3 : 0.2),
        div().absolute().left(sunX).top(sunY).size(28).rounded_full().bg(warm ? "#ffbd6b" : "#ffe28a")]
      : [];
  // Sunrise/sunset: warm haze piled on the horizon, back-lighting the skyline.
  const horizonGlow = sky.golden
    ? [div().absolute().left(-Math.round(w * 0.15)).top(Math.round(h * 0.4)).w(Math.round(w * 1.3)).h(Math.round(h * 0.52)).rounded_full().bg("#ff9d5c").opacity(0.3),
       div().absolute().left(-Math.round(w * 0.05)).top(Math.round(h * 0.5)).w(Math.round(w * 1.1)).h(Math.round(h * 0.42)).rounded_full().bg("#ffd08a").opacity(0.32)]
    : [];
  // Far hills and a city skyline; windows light up after dusk.
  const hillC = late ? "#2a3158" : sky.golden ? "#d6c3ad" : "#c6d3df";
  const hillC2 = late ? "#232a4e" : sky.golden ? "#c4b29e" : "#b9c7d4";
  const scenel = [
    div().absolute().left(-Math.round(w * 0.1)).top(h - Math.round(h * 0.14)).w(Math.round(w * 0.55)).h(Math.round(h * 0.28)).rounded_full().bg(hillC),
    div().absolute().left(Math.round(w * 0.42)).top(h - Math.round(h * 0.18)).w(Math.round(w * 0.6)).h(Math.round(h * 0.36)).rounded_full().bg(hillC2),
  ];
  // Four tones per time of day, setback crowns, rooftop sheds, water towers and blinking
  // aviation lights so the block reads as buildings, not a picket fence.
  const bTones = late
    ? ["#434a7d", "#39406b", "#2e355c", "#272d4e"]
    : sky.golden ? ["#d8bfa8", "#c9ae97", "#b89e8a", "#a08a78"] : ["#c3d0dc", "#b3c3d3", "#a2b3c4", "#93a6b8"];
  const bcount = Math.min(26, Math.max(8, Math.round(w / 64)));
  // A few world-famous silhouettes among the fillers: Eiffel, Big Ben, Oriental Pearl,
  // Petronas (with skybridge), CN Tower and a pyramid.
  const LANDMARKS = ["eiffel", "bigben", "pearl", "petronas", "cntower", "pyramid"];
  let lm = 0;
  const landmark = (kind, bx, bw, tone, dark) => {
    const base = h;
    if (kind === "eiffel") {
      const eh = Math.round(h * 0.34);
      let y = base;
      for (const [sw, hf] of [[34, 0.45], [24, 0.28], [13, 0.16], [7, 0.08]]) {
        const sh = Math.round(eh * hf); y -= sh;
        scenel.push(div().absolute().left(Math.round(bx + (bw - sw) / 2)).top(y).w(sw).h(sh).bg(tone));
      }
      scenel.push(div().absolute().left(bx + 2).top(base - Math.round(eh * 0.62)).w(bw - 4).h(3).bg(dark));
      scenel.push(div().absolute().left(bx + 8).top(base - Math.round(eh * 0.82)).w(bw - 16).h(3).bg(dark));
      scenel.push(div().absolute().left(Math.round(bx + bw / 2) - 1).top(base - eh - 12).w(2).h(12).bg(tone));
      if (late) for (let s = 0; s < 5; s++)
        scenel.push(div().absolute().left(Math.round(bx + (bw - 30) / 2) + ((s * 61) % 30)).top(base - 16 - ((s * 37) % Math.max(10, eh - 22))).size(2).bg("#ffe28a")
          .loop("opacity", { from: 0.4, to: 1, period: 900 + s * 130 }));
    } else if (kind === "bigben") {
      const bh2 = Math.round(h * 0.36), x2 = Math.round(bx + (bw - 14) / 2);
      scenel.push(div().absolute().left(x2).top(base - bh2).w(14).h(bh2).bg(tone));
      scenel.push(div().absolute().left(x2).top(base - bh2 - 8).w(14).h(8).bg(dark));
      scenel.push(div().absolute().left(x2 + 4).top(base - bh2 - 6).size(6).rounded_full().bg(late ? "#ffe28a" : "#d8d2b4"));
      let sy = base - bh2 - 8;
      for (const sw2 of [10, 7, 4]) { sy -= 5; scenel.push(div().absolute().left(Math.round(bx + (bw - sw2) / 2)).top(sy).w(sw2).h(5).bg(tone)); }
      scenel.push(div().absolute().left(Math.round(bx + bw / 2)).top(sy - 8).w(2).h(8).bg(dark));
    } else if (kind === "pearl") {
      const ph = Math.round(h * 0.3), cx2 = Math.round(bx + bw / 2);
      scenel.push(div().absolute().left(cx2 - 9).top(base - 18).size(18).rounded_full().bg(tone));
      scenel.push(div().absolute().left(cx2 - 2).top(base - 16 - Math.round(ph * 0.3)).w(4).h(Math.round(ph * 0.3)).bg(tone));
      scenel.push(div().absolute().left(cx2 - 6).top(base - 28 - Math.round(ph * 0.3)).size(12).rounded_full().bg(tone));
      scenel.push(div().absolute().left(cx2 - 2).top(base - ph - 8).w(4).h(Math.max(6, ph - 30 - Math.round(ph * 0.3))).bg(tone));
      scenel.push(div().absolute().left(cx2 - 4).top(base - ph - 12).size(8).rounded_full().bg(tone));
      scenel.push(div().absolute().left(cx2 - 1).top(base - ph - 24).w(2).h(12).bg(dark));
    } else if (kind === "petronas") {
      const ph = Math.round(h * 0.32);
      for (const off of [0, bw - 10]) {
        scenel.push(div().absolute().left(bx + off).top(base - ph).w(10).h(ph).bg(tone));
        scenel.push(div().absolute().left(bx + off + 3).top(base - ph - 6).w(4).h(6).bg(tone));
        scenel.push(div().absolute().left(bx + off + 4).top(base - ph - 14).w(2).h(8).bg(dark));
        if (late) for (let wy = 8; wy < ph - 14 && wy < 90; wy += 13)
          if (((wy * 13 + off * 7 + bx) % 3) < 2)
            scenel.push(div().absolute().left(bx + off + 3).top(base - ph + wy).w(3).h(4).bg("#ffd98a"));
      }
      scenel.push(div().absolute().left(bx + 10).top(base - Math.round(ph * 0.55)).w(bw - 20).h(3).bg(dark));
    } else if (kind === "cntower") {
      const ch = Math.round(h * 0.4), cx2 = Math.round(bx + bw / 2);
      scenel.push(div().absolute().left(cx2 - 3).top(base - ch).w(6).h(ch).bg(tone));
      scenel.push(div().absolute().left(cx2 - 8).top(base - Math.round(ch * 0.72)).w(16).h(10).rounded(4).bg(tone));
      scenel.push(div().absolute().left(cx2 - 5).top(base - Math.round(ch * 0.72) - 8).w(10).h(6).rounded(3).bg(tone));
      scenel.push(div().absolute().left(cx2 - 1).top(base - ch - 22).w(2).h(14).bg(dark));
      if (late) scenel.push(div().absolute().left(cx2 - 8).top(base - Math.round(ch * 0.72)).w(16).h(10).rounded(4).bg("#ffd98a").opacity(0.3));
    } else if (kind === "pyramid") {
      const ph = Math.max(18, Math.round(h * 0.12));
      for (let i = 0; i < 6; i++) {
        const sw2 = Math.max(4, Math.round(bw * (1 - i / 6)));
        scenel.push(div().absolute().left(bx + Math.round((bw - sw2) / 2)).top(base - Math.round(ph / 6) * (i + 1)).w(sw2).h(Math.round(ph / 6)).bg(i % 2 ? dark : tone));
      }
    }
  };
  for (let k = 0; k < bcount; k++) {
    const bw = 30 + ((k * 31) % 44);
    const bh = Math.round(h * Math.min(0.42, 0.1 + ((k * 47) % 100) / 300 + (k % 7 === 3 ? 0.16 : 0)));
    const bx = Math.round((k * (w - 70)) / bcount) + 8 + ((k * 23) % 24);
    const tone = bTones[(k * 13) % 4];
    const dark = bTones[((k * 13) + 2) % 4];
    if (k % 9 === 2 || k % 9 === 5) { landmark(LANDMARKS[lm++ % LANDMARKS.length], bx, Math.max(bw, 42), tone, dark); continue; }
    scenel.push(div().absolute().left(bx).top(h - bh).w(bw).h(bh).bg(tone));
    if (k % 5 === 2) scenel.push(div().absolute().left(bx + Math.round(bw * 0.2)).top(h - bh - 10).w(Math.round(bw * 0.6)).h(10).bg(tone));
    if (k % 6 === 3) {
      scenel.push(div().absolute().left(bx + Math.round(bw / 2) - 1).top(h - bh - 14).w(2).h(14).bg(dark));
      scenel.push(div().absolute().left(bx + Math.round(bw / 2) - 2).top(h - bh - 16).size(4).rounded_full().bg("#ff5a5a")
        .loop("opacity", { from: 0.2, to: 1, period: 1200 + (k % 3) * 300 }));
    }
    if (k % 4 === 1) scenel.push(div().absolute().left(bx + 4).top(h - bh - 6).w(12).h(6).bg(dark));
    if (k % 7 === 4) {
      scenel.push(div().absolute().left(bx + bw - 12).top(h - bh - 10).w(8).h(7).bg(dark));
      scenel.push(div().absolute().left(bx + bw - 11).top(h - bh - 3).w(1).h(3).bg(dark));
      scenel.push(div().absolute().left(bx + bw - 5).top(h - bh - 3).w(1).h(3).bg(dark));
    }
    if (!late && bh > 30) for (let sx = 6; sx < bw - 6; sx += 10)
      scenel.push(div().absolute().left(bx + sx).top(h - bh + 5).w(3).h(bh - 14).bg(dark).opacity(0.45));
    if (late && bh > 26) {
      let lit = 0;
      for (let wy = 6; wy < bh - 8 && lit < 12; wy += 13)
        for (let wx = 5; wx < bw - 7 && lit < 12; wx += 11)
          if (((k * 131 + wy * 17 + wx * 7) % 9) < 3) {
            const flick = (k + wy + wx) % 7 === 3;
            scenel.push(div().absolute().left(bx + wx).top(h - bh + wy).w(3).h(4).bg("#ffd98a")
              .when(flick, (el) => el.loop("opacity", { from: 0.35, to: 1, period: 2100 })));
            lit++;
          }
    }
  }
  // Drifting clouds whatever the weather; warm at sunrise/sunset, dim at night.
  const cloudC = late ? "#3d4670" : warm ? "#ffd9b0" : "#ffffff";
  const clouds = [0, 1, 2, 3].map((k) => {
    const cw = 54 + ((k * 37) % 30);
    return div().absolute().left(Math.round(w * (0.12 + k * 0.22))).top(Math.round(h * (0.08 + (k % 3) * 0.11))).w(cw).h(10).opacity(late ? 0.7 : 0.9)
      .loop("left", { from: -cw - 20, to: w + 20, period: 90000 + k * 18000, easing: "linear" })
      .children([
        div().absolute().left(0).top(4).w(cw).h(6).rounded(3).bg(cloudC),
        div().absolute().left(Math.round(cw * 0.2)).top(0).w(Math.round(cw * 0.45)).h(7).rounded(4).bg(cloudC),
        div().absolute().left(Math.round(cw * 0.55)).top(2).w(Math.round(cw * 0.3)).h(5).rounded(3).bg(cloudC),
      ]);
  });
  // Daytime birds cross the sky; one red-eye flight drifts overhead at night.
  const birdC = warm ? "#8a7590" : "#5b6b7d";
  const birds = !late && dayish && !stormy
    ? [0, 1, 2].map((k) => div().absolute().top(14 + k * 12).w(6).h(2)
      .loop("left", { from: w + 10, to: -20, period: 22000 + k * 6000, easing: "linear" })
      .children([div().absolute().left(2).top(0).w(2).h(1).bg(birdC),
        div().absolute().left(0).top(1).w(2).h(1).bg(birdC),
        div().absolute().left(4).top(1).w(2).h(1).bg(birdC)]))
    : [];
  const plane = late && weather !== "fog"
    ? [div().absolute().top(Math.round(transom * 0.4)).w(9).h(4)
      .loop("left", { from: w + 20, to: -30, period: 52000, easing: "linear" })
      .children([div().absolute().left(0).top(1).w(7).h(2).bg("#e6ecf2"),
        div().absolute().left(2).top(0).w(3).h(1).bg("#cfd8e0"),
        div().absolute().left(6).top(0).w(2).h(2).bg("#ff5a5a").loop("opacity", { from: 0.2, to: 1, period: 900 })])]
    : [];
  const mullions = Array.from({ length: cols - 1 }, (_, i) =>
    div().absolute().left(Math.round((i + 1) * colW) - 2).top(0).w(4).h(h).bg(FRAME));
  return div().absolute().left(x).top(0).w(w).h(h).bg(sky.bottom).overflow_hidden()
    .child(div().absolute().left(0).top(0).w_full().h(h * 0.55).bg(stormy ? "#6f8296" : sky.top))
    .children(horizonGlow)
    .children(stars)
    .children(cel)
    .children(scenel)
    .children(clouds)
    .children(birds)
    .children(plane)
    .children(weatherIn(weather, w, h, late, warm))
    .children(mullions)
    .child(div().absolute().left(0).top(transom).w(w).h(4).bg(FRAME))
    .child(div().absolute().left(0).top(0).w(w).h(5).bg(FRAME))
    .child(div().absolute().left(0).top(h - 6).w(w).h(6).bg(SILL))
    .child(div().absolute().left(0).top(0).w(5).h(h).bg(FRAME))
    .child(div().absolute().left(w - 5).top(0).w(5).h(h).bg(FRAME));
}

function weatherIn(kind, w, h, late, warm) {
  const n = (k, a, b) => a + ((k * 7919) % (b - a));
  const count = (per, cap) => Math.max(8, Math.min(cap, Math.round(w / per)));
  if (kind === "rain" || kind === "storm" || kind === "drizzle") {
    const drops = Array.from({ length: count(52, 26) }, (_, k) => div().absolute().left(n(k, 8, w - 8)).w(1).h(kind === "drizzle" ? 5 : 8).bg("#d6e6ff")
      .loop("top", { from: -10 - (k % 3) * 9, to: h, period: 520 + (k % 4) * 90, easing: "linear" }));
    if (kind === "storm") drops.push(div().absolute().left(0).top(0).w(w).h(h).bg("#ffffff")
      .loop("opacity", { from: 0, to: 0.45, period: 3800, easing: "ease-in" }));
    return drops;
  }
  if (kind === "snow") {
    return Array.from({ length: count(60, 22) }, (_, k) => {
      const x = n(k, 8, w - 8);
      return div().absolute().left(x).size(3).rounded_full().bg("#ffffff")
        .loop("top", { from: -6 - (k % 4) * 10, to: h, period: 3000 + (k % 5) * 400, easing: "linear" })
        .loop("left", { from: x - 3, to: x + 3, period: 1400 + (k % 3) * 300 });
    });
  }
  if (kind === "clouds" || kind === "partly") {
    const c1 = late ? "#3d4670" : warm ? "#ffd9b0" : "#ffffff";
    const c2 = late ? "#323a5c" : warm ? "#f2bd8e" : "#e9eef3";
    return [0, 1, 2, 3].map((k) => div().absolute().top(10 + (k % 3) * 18).w(56 - k * 6).h(12).rounded(6).bg(k % 2 ? c2 : c1)
      .loop("left", { from: -56, to: w, period: 60000 + k * 15000, easing: "linear" }));
  }
  if (kind === "fog") return [div().absolute().left(0).top(0).w(w).h(h).bg(late ? "#8a93ad" : "#e8eef2").opacity(0.55)];
  return [];
}

// CC0 pixel weather pack (32×32 PNG). Keep native size so pixels stay crisp.
const WX_BG = {
  clear: "#8ecdf0", clearNight: "#16214a", partly: "#a7d4ec", partlyNight: "#1a2547",
  clouds: "#c6d8e4", fog: "#b9c6d2", drizzle: "#a3b6c8", rain: "#7d95ad", snow: "#9fb6cc", storm: "#4c5b74",
};
const WX_ICONS = {
  clear: "mods/office-2/icons/sun.png",
  clearNight: "mods/office-2/icons/moon.png",
  partly: "mods/office-2/icons/partly-cloudy.png",
  clouds: "mods/office-2/icons/cloud.png",
  fog: "mods/office-2/icons/fog.png",
  drizzle: "mods/office-2/icons/drizzle.png",
  rain: "mods/office-2/icons/rain.png",
  snow: "mods/office-2/icons/snow.png",
  storm: "mods/office-2/icons/storm.png",
};

function weatherIcon(kind, dark) {
  const bg = dark && kind === "clear" ? WX_BG.clearNight : dark && kind === "partly" ? WX_BG.partlyNight : WX_BG[kind] ?? WX_BG.clouds;
  const icon = kind === "clear" && dark ? WX_ICONS.clearNight : WX_ICONS[kind] ?? WX_ICONS.clouds;
  return div().absolute().left(0).top(0).w(56).h(40).bg(bg).overflow_hidden()
    .flex().items_center().justify_center().child(image(icon).w(32).h(32).flex_none());
}

export function weatherBoard(x, y, timeText, kind, meta, dark) {
  const cond = { clear: "CLEAR", partly: "PARTLY", clouds: "CLOUDY", fog: "FOG", drizzle: "DRIZZLE", rain: "RAIN", snow: "SNOW", storm: "STORM" }[kind] ?? "WEATHER";
  const temp = meta?.temp == null ? "--°" : `${meta.temp}°C`;
  const wind = meta?.wind == null ? null : `${meta.wind} km/h`;
  const hum = meta?.hum == null ? null : `${meta.hum}%`;
  const place = meta?.place ?? "LOCAL";
  return div().absolute().left(x).top(y).w(150).rounded(3).overflow_hidden().border_2().border_color("#84958b")
    .child(div().w_full().h(20).px(6).bg("#3a5a48").flex().items_center().justify_between().text_color("#eef5f0")
      .child(div().truncate().text_size(9).font_bold().child(place))
      .child(div().text_size(11).font_bold().child(timeText)))
    .child(div().flex().items_center().gap(8).p(6).bg("#eef2ed")
      .child(div().w(56).h(40).relative().overflow_hidden().rounded(3).child(weatherIcon(kind, dark)))
      .child(div().flex_1().flex().flex_col().gap(3)
        .child(div().flex().items_end().gap(4)
          .child(div().text_size(19).font_bold().text_color("#1d1d24").child(temp))
          .child(div().text_size(9).font_bold().text_color("#5a6b5f").pb(1).child(cond)))
        .child(div().text_size(9).text_color("#6b7a72").child([wind, hum].filter(Boolean).join(" · ") || "—"))));
}

// Small architectural details that keep the short office strip from feeling flat.
export function floorRunner(x, y, w) {
  return div().absolute().left(x).top(y).w(w).h(12).rounded(3).bg("#7f5b43")
    .border_1().border_color("#654632").children([
      div().absolute().left(5).top(3).w(w - 10).h(2).bg("#a97b58"),
      div().absolute().left(5).top(7).w(w - 10).h(1).bg("#684934"),
      ...Array.from({ length: Math.max(1, Math.floor(w / 42)) }, (_, k) =>
        div().absolute().left(18 + k * 42).top(1).w(1).h(10).bg("#6c4b37")),
    ]);
}

export function ceilingLights(xs) {
  return xs.flatMap((x, k) => [
    div().absolute().left(x).top(5).w(1).h(10).bg("#80694f"),
    div().absolute().left(x - 10).top(14).w(21).h(3).rounded(2).bg("#c5a66f"),
    div().absolute().left(x - 15).top(17).w(31).h(12).rounded_full().bg(k % 2 ? "#ffe6a3" : "#fff1c2").opacity(0.16),
  ]);
}

export function coffeeSteam(x, y) {
  return [0, 1].map((k) => div().absolute().left(x + k * 5).top(y - k * 3).text_size(10)
    .text_color("#fff8df").opacity(0.65).frames(["·", "~", " ", "~"], 1100 + k * 180));
}

// Small interior layers: they sit behind the furniture and make the room feel occupied.
export function roomDetails(W, H, g, night, weather) {
  const P = g.P;
  const floor = g.floorY;
  const warm = "#ffd27a";
  const cool = "#6fb9e8";
  return [
    // A broad, high-contrast rug; the lower edge remains visible in front of the sofa.
    div().absolute().left(g.couchX).top(floor - 5 * P).w(A.COUCH_SPRITE.frame.width * P).h(5 * P).rounded(2 * P).bg(night ? "#455a86" : "#b98258")
      .border_1().border_color(night ? "#7087b2" : "#d1a071").opacity(0.95),
    div().absolute().left(g.couchX + 3 * P).top(floor - 3 * P).w((A.COUCH_SPRITE.frame.width - 6) * P).h(P).bg(night ? "#687fae" : "#d4a06f").opacity(0.85),
    div().absolute().left(g.couchX - 10 * P).top(floor - 24 * P).w(2 * P).h(22 * P).bg("#594638"),
    div().absolute().left(g.couchX - 14 * P).top(floor - 26 * P).w(10 * P).h(3 * P).rounded(2 * P).bg(warm),
    div().absolute().left(g.couchX - 18 * P).top(floor - 28 * P).w(18 * P).h(12 * P).rounded_full().bg(warm).opacity(night ? 0.22 : 0.1),
    // blue cooler indicator and a small coffee-machine status light
    div().absolute().left(g.coolerX + 3 * P).top(floor - 18 * P).w(2 * P).h(2 * P).rounded_full().bg(cool)
      .loop("opacity", { from: 0.35, to: 1, period: 1800 }),
    div().absolute().left(g.zoneX + 4 * P).top(floor - 20 * P).size(2 * P).rounded_full().bg("#e05252")
      .loop("opacity", { from: 0.35, to: 1, period: 1300 }),
    // overhead cable rail, echoing the stainless window mullions
    div().absolute().left(g.x0).top(30).w(Math.max(80, g.zoneX - g.x0 + 100)).h(2).bg("#59636c").opacity(0.8),
    div().absolute().left(g.x0 + 34 * P).top(30).w(2).h(10).bg("#59636c"),
    div().absolute().left(g.x0 + 34 * P - 8).top(39).w(18).h(2).rounded(1).bg(night ? "#e4bc72" : "#c5a66f").opacity(0.9),
    // Rain/blue reflection stays at the glass side; warm room lights counter it.
    ...((weather === "rain" || weather === "storm" || weather === "drizzle")
      ? [div().absolute().right(0).top(0).w(Math.max(100, W * 0.28)).h(floor).bg(night ? "#5284bd" : "#8fc7e8").opacity(night ? 0.08 : 0.045),
         div().absolute().right(Math.max(20, W * 0.08)).top(floor - 10 * P).w(70 * P).h(P).bg(night ? "#7da9d2" : "#d4edf7").opacity(0.22)
           .loop("left", { from: -8 * P, to: 8 * P, period: 4200 })] : []),
  ];
}

export function lifeProps(g, night, paperPulse) {
  const P = g.P;
  const floor = g.floorY;
  const paper = "#f4f1e8";
  const metal = night ? "#687481" : "#8d989e";
  const dark = night ? "#303b4c" : "#5c6268";
  return [
    // Compact printer on the counter: a bright top and paper make it readable at a glance.
    ...(() => {
      const printerX = g.zoneX + 12 * P;
      const printerW = A.COUNTER_SPRITE.frame.width - 14;
      const counterTop = floor - 11 * P;
      const printerH = 8 * P;
      return [
        div().absolute().left(printerX).top(counterTop - printerH).w(printerW * P).h(printerH).rounded(P).bg(dark)
          .border_2().border_color(metal),
        div().absolute().left(printerX + P).top(counterTop - printerH - 2 * P).w((printerW - 2) * P).h(3 * P).rounded(P).bg(metal),
        div().absolute().left(printerX + 2 * P).top(counterTop - 4 * P).w((printerW - 4) * P).h(2 * P).bg("#222a34"),
        div().absolute().left(printerX + 3 * P).top(counterTop - printerH - (paperPulse ? 4 : 2) * P).w(4 * P).h(6 * P).bg(paper)
          .border_1().border_color("#c9c7bd").loop("top", { from: -P, to: P, period: 2600 }),
        div().absolute().left(printerX + (printerW - 3) * P).top(counterTop - 5 * P).size(2 * P).rounded_full().bg("#58c26b")
          .loop("opacity", { from: 0.35, to: 1, period: 1300 }),
      ];
    })(),
    // Small bin between the kitchen and lounge.
    div().absolute().left(g.coolerX + 12 * P).top(floor - 8 * P).w(6 * P).h(8 * P).rounded(P).bg(night ? "#3e4653" : "#72777b"),
    div().absolute().left(g.coolerX + 11 * P).top(floor - 9 * P).w(8 * P).h(2 * P).rounded(P).bg(dark),
    div().absolute().left(g.coolerX + 14 * P).top(floor - 7 * P).w(2 * P).h(P).bg(night ? "#596574" : "#9ba0a2"),
    // Cat bowl by the couch: rim, inside, and food make it read as a bowl.
    div().absolute().left(g.couchX + 8 * P).top(floor - 3 * P).w(10 * P).h(3 * P).rounded(2 * P).bg(night ? "#53647e" : "#b56d4f"),
    div().absolute().left(g.couchX + 9 * P).top(floor - 4 * P).w(8 * P).h(P).rounded(P).bg(night ? "#8298c3" : "#e5ad78"),
    div().absolute().left(g.couchX + 10 * P).top(floor - 3 * P).w(6 * P).h(P).rounded(P).bg(night ? "#263247" : "#6b4030"),
    div().absolute().left(g.couchX + 12 * P).top(floor - 3 * P).w(3 * P).h(P).rounded(P).bg("#e0b43d"),
  ];
}

export function petCorner(g, night) {
  const P = g.P;
  const floor = g.floorY;
  const ink = night ? "#39465d" : "#6d4b35";
  return [
    // Cat bed and scratching post, tucked beside the sofa.
    div().absolute().left(g.couchX + 22 * P).top(floor - 5 * P).w(10 * P).h(4 * P).rounded(3 * P).bg(night ? "#4b6497" : "#c47d58")
      .border_2().border_color(night ? "#8298c3" : "#e5ad78"),
    div().absolute().left(g.couchX + 24 * P).top(floor - 7 * P).w(6 * P).h(3 * P).rounded(3 * P).bg(night ? "#7692c5" : "#e7ae7d"),
    div().absolute().left(g.couchX + 25 * P).top(floor - 6 * P).w(4 * P).h(P).rounded(P).bg(night ? "#a8bbdc" : "#f1c18f"),
    div().absolute().left(g.couchX + 36 * P).top(floor - 20 * P).w(3 * P).h(18 * P).bg(ink)
      .border_1().border_color(night ? "#71809a" : "#8b634a"),
    div().absolute().left(g.couchX + 32 * P).top(floor - 22 * P).w(11 * P).h(3 * P).rounded(2 * P).bg(ink),
    div().absolute().left(g.couchX + 37 * P).top(floor - 18 * P).w(P).h(4 * P).bg(night ? "#a8bbdc" : "#d99a70"),
  ];
}

export function deskAccent(status, P, away, overtime) {
  if (!status || away) return [];
  if (status === "blocked") return [
    div().absolute().left(36 * P).top((A.PERSON_FRAME.height - 25) * P).size(4 * P).rounded_full().bg("#ff4d55")
      .loop("opacity", { from: 0.25, to: 1, period: 650 }),
    div().absolute().left(34 * P).top((A.PERSON_FRAME.height - 27) * P).w(8 * P).h(8 * P).rounded_full().bg("#ff4d55").opacity(0.11),
  ];
  if (status === "done") return [
    div().absolute().left(36 * P).top((A.PERSON_FRAME.height - 25) * P).size(3 * P).rounded_full().bg("#6be38b"),
  ];
  if (overtime) return [
    div().absolute().left(8 * P).top((A.PERSON_FRAME.height - 23) * P).w(3 * P).h(2 * P).bg("#e07a5f"),
  ];
  return [div().absolute().left(36 * P).top((A.PERSON_FRAME.height - 25) * P).size(2 * P).rounded_full().bg("#58c26b")];
}

export function whiteboard(x, y, rows) {
  const shown = rows.filter(([, , , show]) => show !== false);
  return div().absolute().left(x).top(y).w(150).px(8).pt(6).pb(7).bg("#fbfbf8")
    .border_3().border_color("#a6adb8").rounded(2).flex().flex_col().text_size(10).font_bold().gap(3)
    .child(div().flex().items_center().justify_between().text_color("#536070")
      .child("TEAM STATUS")
      .child(div().size(6).rounded_full().bg("#58c26b").loop("opacity", { from: 0.35, to: 1, period: 1400 })))
    .child(div().h(1).bg("#e6e9ec"))
    .child(div().flex().flex_col().gap(4).children(shown.map(([color, label, count]) =>
      div().flex().items_center().justify_between()
        .child(div().flex().items_center().gap(6)
          .child(div().size(6).rounded(1).bg(color).flex_none())
          .child(div().text_color("#3a4350").child(label)))
        .child(div().text_color("#6b7a72").child(String(count))))))
    .child(div().h(4).rounded(1).bg("#dfe4e8"));
}

// "DAYS CLEAR" resets to a blinking 0 while someone is blocked.
export function incidentSign(x, y, h, days, now) {
  return div().absolute().left(x).top(y).w(112).h(Math.min(h, 74)).p(5).bg("#f6d44c").border_3().border_color(INK)
    .flex().flex_col().items_center().justify_between().text_color(INK)
    .child(div().text_size(10).font_bold().child("DAYS CLEAR"))
    .child(div().px(10).rounded(3).bg("#1d1d24").text_size(22).font_bold().text_color(now ? "#ff5a5a" : "#7dff9a")
      .child(String(now ? 0 : days)).when(now, (el) => el.loop("opacity", { from: 0.35, to: 1, period: 600 })))
    .child(div().text_size(9).font_bold().text_color("#5c4a1b").child("BLOCKED RESETS"));
}

// A small wall calendar gives the glass wall a lived-in office detail.
export function wallCalendar(x, y, date, night) {
  const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()];
  const paper = night ? "#d9dfdf" : "#fbf8f1";
  const ink = night ? "#39465d" : "#3b3b44";
  return div().absolute().left(x).top(y).w(70).h(66).p(4).bg("#a86f4d").border_2().border_color("#694936").rounded(2)
    .child(div().absolute().left(27).top(-5).w(16).h(8).rounded(1).bg("#d7b85f"))
    .child(div().size_full().bg(paper).border_1().border_color("#9aa2ab").flex().flex_col().items_center()
      .child(div().w_full().h(14).bg("#e05252").text_size(9).font_bold().text_color("#fffaf0").flex().items_center().justify_center().child(month))
      .child(div().text_size(25).font_bold().text_color(ink).child(String(date.getDate())))
      .child(div().flex().gap(3).children([0, 1, 2, 3].map((k) => div().size(4).rounded_full().bg(["#3d8be0", "#58a368", "#e0b43d", "#9b6bdc"][k])))));
}

// A framed head-and-shoulders of the busiest agent.
export function portrait(x, y, h, who) {
  const p = 3;
  const face = who
    ? div().absolute().left(16).top(-(A.PERSON_FRAME.height - 21) * p + 4).w(A.PERSON_FRAME.width * p).h(A.PERSON_FRAME.height * p)
      .children([...A.STAND.body, ...(who.remote ? A.HEADSET.stand : [])].map((rect) => renderPart([[rect[0], rect[1], rect[2], rect[3], rect[4]]], A.PERSON_FRAME, who.pal, p)))
    : div().size_full().flex().items_center().justify_center().text_size(18).text_color("#fffaf0").child("?");
  return div().absolute().left(x).top(y).w(84).flex().flex_col().items_center().gap(2)
    .child(div().w(70).h(Math.min(h - 26, 62)).p(3).bg("#c99640").border_1().border_color("#8a6420")
      .child(div().relative().size_full().overflow_hidden().bg("#3d4a6b").child(face)))
    .child(div().w(84).py(1).rounded(2).bg("#e0b43d").flex().flex_col().items_center().text_color("#3b2a1a")
      .child(div().text_size(9).font_bold().child("EMPLOYEE OF THE MONTH"))
      .child(div().max_w(80).truncate().text_size(9).child(who?.name ?? "vacant")));
}

// A call on the wall with everyone working from another machine: each tile shows how
// they're doing, and clicking one goes to their terminal.
export function videoWall(x, y, h, remotes) {
  const p = 3;
  const ring = { working: "#3d8be0", blocked: "#e05252", done: "#58c26b", idle: "#5b6270" };
  const tile = (r) => {
    const st = r.status;
    const face = div().absolute().left(-1).top(-(A.PERSON_FRAME.height - 21) * p + 4).w(A.PERSON_FRAME.width * p).h(A.PERSON_FRAME.height * p)
      .children([...A.STAND.body, ...A.HEADSET.stand].map((rect) => renderPart([[rect[0], rect[1], rect[2], rect[3], rect[4]]], A.PERSON_FRAME, r.pal, p)))
      .when(st === "working", (el) => el.loop("top", { from: -(A.PERSON_FRAME.height - 21) * p + 4, to: -(A.PERSON_FRAME.height - 21) * p + 2, period: 320 }));
    return div().id(`call-${r.address}`).w(48).h(48).relative().overflow_hidden().rounded(3).bg("#24425a")
      .border_2().border_color(ring[st] ?? ring.idle).cursor_pointer().tooltip(r.title)
      .on_click(() => run("pane.focus", { pane: r.pane }))
      .child(face)
      .when(st === "working", (el) => el.child(div().absolute().left(0).top(0).size_full().bg("#7fb6ff").opacity(0.12)))
      .when(st === "idle", (el) => el.child(div().absolute().left(0).top(0).size_full().bg("#0b1030").opacity(0.5))
        .child(div().absolute().right(3).top(1).text_size(9).font_bold().text_color("#c9c2ff").frames(["z", "zZ", "zZz"], 900)))
      .when(st === "blocked", (el) => el.child(div().absolute().right(2).top(1).px(3).rounded(3).bg("#e05252")
        .text_size(10).font_bold().text_color("#ffffff").child("!").loop("opacity", { from: 0.4, to: 1, period: 600 })))
      .when(st === "done", (el) => el.child(div().absolute().right(2).top(1).px(3).rounded(3).bg("#2f9a50")
        .text_size(10).font_bold().text_color("#ffffff").child("✓")))
      .child(div().absolute().left(0).bottom(0).w_full().h(10).bg("#000000aa").px(2).flex().items_center()
        .text_size(9).text_color("#ffffff").child(div().truncate().child(r.name)));
  };
  const machines = [...new Set(remotes.map((r) => r.machine))].join(", ");
  return div().absolute().left(x).top(y).p(4).bg("#1d1d24").rounded(3).border_2().border_color("#3b3b44").flex().flex_col().gap(3)
    .child(div().flex().items_center().gap(4).max_w(48 * 3 + 6).text_size(10).font_bold()
      .child(div().size(5).flex_none().rounded_full().bg("#e05252").loop("opacity", { from: 0.3, to: 1, period: 1200 }))
      .child(div().truncate().text_color("#cfd6e0").child(`REMOTE · ${machines}`)))
    .child(div().flex().flex_wrap().gap(3).max_w(48 * 3 + 6).max_h(h - 22).overflow_hidden().children(remotes.slice(0, 6).map(tile)));
}

// The way in and out, on the back wall. Open while someone passes through.
export function door(x, wallBottom, P, open) {
  const w = 16 * P, h = Math.min(28 * P, wallBottom - 30);
  return div().absolute().left(x).top(wallBottom - h).w(w).h(h)
    .child(div().absolute().left(w / 2 - 18).top(-20).w(36).h(14).rounded(2).bg("#2f9a50").flex().items_center().justify_center()
      .text_size(9).font_bold().text_color("#eaffef").child("EXIT"))
    .child(div().absolute().left(0).top(0).w(w).h(h).bg("#5c3a22"))
    .child(div().absolute().left(P).top(P).w(w - 2 * P).h(h - P).bg(open ? "#1f1a16" : "#8a5a35"))
    .when(open, (el) => el.child(div().absolute().left(P).top(h - 4 * P).w(w - 2 * P).h(3 * P).bg("#3a302a")))
    .when(!open, (el) => el
      .child(div().absolute().left(3 * P).top(4 * P).w(w - 6 * P).h(h / 2 - 6 * P).border_2().border_color("#7d4f2e"))
      .child(div().absolute().left(3 * P).top(h / 2 + P).w(w - 6 * P).h(h / 2 - 5 * P).border_2().border_color("#7d4f2e"))
      .child(div().absolute().left(w - 4 * P).top(h / 2).size(2 * P).rounded_full().bg("#e0b43d")));
}

export function stringLights(W, y) {
  const colors = ["#e05252", "#e0b43d", "#58b368", "#3d8be0"];
  const els = [div().absolute().left(0).top(y).w(W).h(1).bg("#2f4a2f")];
  for (let x = 14, k = 0; x < W; x += 28, k++)
    els.push(div().absolute().left(x).top(y + 1).w(5).h(7).rounded(2).bg(colors[k % 4])
      .loop("opacity", { from: k % 2 ? 0.35 : 1, to: k % 2 ? 1 : 0.35, period: 1600 }));
  return els;
}

export function banner(W, y, text, bg) {
  return div().absolute().left(W / 2 - 110).top(y).w(220).h(22).rounded(3).bg(bg).flex().items_center().justify_center()
    .text_size(12).font_bold().text_color("#fffaf0").child(text);
}

// A spinning red light over the desk, and the whole room washed red in time.
export function alarm(W, H, x) {
  return [
    div().absolute().left(0).top(0).w(W).h(H).bg("#ff2a2a").loop("opacity", { from: 0, to: 0.13, period: 900 }),
    div().absolute().left(x - 10).top(0).w(20).h(6).bg("#3b3b44"),
    div().absolute().left(x - 8).top(6).w(16).h(10).rounded(5).bg("#ff3b3b").loop("opacity", { from: 0.4, to: 1, period: 450 }),
    div().absolute().left(x - 40).top(4).w(80).h(26).rounded_full().bg("#ff5a5a").loop("opacity", { from: 0, to: 0.35, period: 450 }),
  ];
}
