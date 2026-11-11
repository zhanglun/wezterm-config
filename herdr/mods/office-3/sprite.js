import { div } from "gpui-kit";

export function renderPart(list, frameDef, palette, scale = 1, face = 1) {
  const mirrored = face < 0
    ? list.map(([x, y, width, height, color]) => [frameDef.width - x - width, y, width, height, color])
    : list;
  return div().absolute().left(0).top(0).w(frameDef.width * scale).h(frameDef.height * scale)
    .children(mirrored.map(([x, y, width, height, color]) =>
      div().absolute().left(x * scale).top(y * scale).w(width * scale).h(height * scale)
        .bg(palette[color] ?? color)));
}

export function actor(frameDef, x, y, children, scale = 1) {
  return div().absolute().left(x - frameDef.anchorX * scale).top(y - frameDef.anchorY * scale)
    .w(frameDef.width * scale).h(frameDef.height * scale).children(children);
}
