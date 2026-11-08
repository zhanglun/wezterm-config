// The stable decor API. Everything is re-exported from the domain files under
// decor/: windows.js (the glass wall and its weather), room.js (interior
// architecture and floor dressing), widgets.js (boards, signs, wall pieces),
// and seasonal.js (string lights, banners, alarm). main.js imports only this
// file. Domain files may import art.js; art never imports decor.
export * from "./decor/windows.js";
export * from "./decor/room.js";
export * from "./decor/widgets.js";
export * from "./decor/seasonal.js";
