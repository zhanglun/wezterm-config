// Interior architecture and floor-level dressing: the floor strip, ceiling
// lights, small life props, the pet corner, and the door.
import { div } from "gpui-kit";
import * as A from "../art.js";

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
export function roomDetails(W, H, g, night, weather) {
  const P = g.P;
  const floor = g.floorY;
  const warm = "#ffd27a";
  const cool = "#6fb9e8";
  return [
    // A broad, high-contrast rug; the lower edge remains visible in front of the sofa.
    div().absolute().left(g.couchX).top(floor - 5 * P).w(A.COUCH.width * P).h(5 * P).rounded(2 * P).bg(night ? "#455a86" : "#b98258")
      .border_1().border_color(night ? "#7087b2" : "#d1a071").opacity(0.95),
    div().absolute().left(g.couchX + 3 * P).top(floor - 3 * P).w((A.COUCH.width - 6) * P).h(P).bg(night ? "#687fae" : "#d4a06f").opacity(0.85),
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
      const printerW = A.COUNTER.width - 14;
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
    // Cat bowl by the couch: a low, readable pixel accent rather than another large prop.
    div().absolute().left(g.couchX + 9 * P).top(floor - 3 * P).w(8 * P).h(2 * P).rounded(P).bg(night ? "#53647e" : "#b56d4f"),
    div().absolute().left(g.couchX + 11 * P).top(floor - 4 * P).w(4 * P).h(P).rounded(P).bg("#e0b43d"),
  ];
}

export function petCorner(g, night) {
  const P = g.P;
  const floor = g.floorY;
  const ink = night ? "#39465d" : "#6d4b35";
  return [
    // Cat bed and scratching post, tucked beside the sofa.
    div().absolute().left(g.couchX + 22 * P).top(floor - 5 * P).w(10 * P).h(4 * P).rounded(3 * P).bg(night ? "#4b6497" : "#c47d58")
      .border_1().border_color(night ? "#8298c3" : "#e5ad78"),
    div().absolute().left(g.couchX + 24 * P).top(floor - 7 * P).w(6 * P).h(3 * P).rounded(3 * P).bg(night ? "#7692c5" : "#e7ae7d"),
    div().absolute().left(g.couchX + 36 * P).top(floor - 20 * P).w(3 * P).h(18 * P).bg(ink)
      .border_1().border_color(night ? "#71809a" : "#8b634a"),
    div().absolute().left(g.couchX + 32 * P).top(floor - 22 * P).w(11 * P).h(3 * P).rounded(2 * P).bg(ink),
    div().absolute().left(g.couchX + 37 * P).top(floor - 18 * P).w(P).h(4 * P).bg(night ? "#a8bbdc" : "#d99a70"),
  ];
}
export function door(x, wallBottom, P, open) {
  const w = 16 * P, h = Math.min(28 * P, wallBottom - 30);
  return div().absolute().left(x).top(wallBottom - h).w(w).h(h)
    .child(div().absolute().left(w / 2 - 18).top(-20).w(36).h(14).rounded(2).bg("#2f9a50").flex().items_center().justify_center()
      .text_size(8).font_bold().text_color("#eaffef").child("EXIT"))
    .child(div().absolute().left(0).top(0).w(w).h(h).bg("#5c3a22"))
    .child(div().absolute().left(P).top(P).w(w - 2 * P).h(h - P).bg(open ? "#1f1a16" : "#8a5a35"))
    .when(open, (el) => el.child(div().absolute().left(P).top(h - 4 * P).w(w - 2 * P).h(3 * P).bg("#3a302a")))
    .when(!open, (el) => el
      .child(div().absolute().left(3 * P).top(4 * P).w(w - 6 * P).h(h / 2 - 6 * P).border_2().border_color("#7d4f2e"))
      .child(div().absolute().left(3 * P).top(h / 2 + P).w(w - 6 * P).h(h / 2 - 5 * P).border_2().border_color("#7d4f2e"))
      .child(div().absolute().left(w - 4 * P).top(h / 2).size(2 * P).rounded_full().bg("#e0b43d")));
}
