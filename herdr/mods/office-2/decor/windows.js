// The glass wall: sky, stars, sun/moon, skyline with landmarks, clouds, birds,
// a red-eye flight, and weather particles. One cohesive unit sharing the same
// day/night math — split a skyline builder into skyline.js if this grows past
// ~200 lines again. weatherBoard (widgets.js) shares the weather-kind names.
import { div } from "gpui-kit";

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
