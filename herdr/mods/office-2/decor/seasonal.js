// Seasonal lighting and banners.
import { div } from "gpui-kit";

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
