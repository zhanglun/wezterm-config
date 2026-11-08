// Shared rectangle rendering helpers.
import { div } from "gpui-kit";

// px per art unit; the scene sets it from its height before drawing.
export let P = 3;
export const setScale = (p) => { P = p; };
export const BOX = 30; // units above the floor line a sprite's box reaches

export const mirror = (rects, width) => rects.map(([x, y, w, h, c]) => [width - x - w, y, w, h, c]);

export function rects(list, pal, p = P) {
  return list.map(([x, y, w, h, c]) =>
    div().absolute().left(x * p).top((BOX + y) * p).w(w * p).h(h * p).bg(pal[c] ?? c));
}

// One movable part of a sprite: its own box, so a loop on it moves all its rects.
export function layer(list, pal, width, p = P) {
  return div().absolute().left(0).top(0).w(width * p).h(BOX * p).children(rects(list, pal, p));
}
