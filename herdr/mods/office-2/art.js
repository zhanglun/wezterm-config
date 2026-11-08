// The stable art API. Everything is re-exported from the domain files under
// art/: render.js (rect helpers), palette.js (colors and agent looks),
// people.js, furniture.js, props.js, and cat.js. main.js and decor.js import
// only this file, so domain files can move or split without touching callers.
export * from "./art/render.js";
export * from "./art/palette.js";
export * from "./art/people.js";
export * from "./art/furniture.js";
export * from "./art/props.js";
export * from "./art/cat.js";
