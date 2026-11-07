// People: standing, sitting, walking, carrying, and headset parts.
import { div } from "gpui-kit";
import { mirror, rects, BOX, P } from "./render.js";

// The layout footprint stays 16×30, while people are authored on a 32×60 grid.
// p/2 preserves the same physical size; GPUI keeps these as hard-edged rects.
export const HI_PERSON = 32;
export const HI_BOX = 60;
export function personLayer(list, pal, face, p = P) {
  const art = PERSON_HIRES.get(list);
  const visible = face < 0 ? mirror(art, HI_PERSON) : art;
  return div().absolute().left(0).top(0).w(PERSON * p).h(BOX * p)
    .children(rects(visible, pal, p / 2, HI_BOX));
}


// People face right; the left-facing ones are mirrored in a box PERSON wide.
export const PERSON = 16;

// Side-profile silhouette inspired by the supplied Walk.png: stepped hair, nose, jaw,
// narrow shoulders, a long coat/shirt and separated legs. The art box stays 16×30.
const head = (x, y) => [
  [x + 1, y, 3, 1, "skin"], [x, y + 1, 5, 1, "skin"], [x, y + 2, 5, 2, "skin"],
  [x + 1, y + 4, 4, 1, "skin"], [x + 2, y + 5, 2, 1, "skin"],
  [x + 5, y + 2, 1, 1, "skin"], [x + 3, y + 2, 1, 1, "eye"], [x + 1, y + 3, 1, 1, "skin"],
  [x + 1, y - 1, 4, 1, "hair"], [x - 1, y, 6, 1, "hair"], [x - 1, y + 1, 2, 3, "hair"], [x + 4, y, 1, 2, "hairHi"],
];

export const STAND = {
  body: [...head(3, -19), [4, -12, 3, 1, "skin"], [4, -11, 4, 1, "shirt"], [3, -10, 6, 1, "shirt"],
    [2, -9, 7, 2, "shirt"], [2, -7, 2, 1, "shirtDark"], [4, -7, 5, 1, "shirt"], [3, -6, 6, 1, "belt"],
    [4, -11, 1, 1, "collar"], [6, -10, 1, 4, "shirtDark"]],
  backLeg: [[3, -5, 3, 1, "pants2"], [3, -4, 2, 2, "pants2"], [2, -2, 2, 1, "pants2"], [1, -1, 4, 1, "shoe"]],
  frontLeg: [[6, -5, 3, 1, "pants"], [7, -4, 2, 2, "pants"], [7, -2, 2, 1, "pants"], [7, -1, 4, 1, "shoe"]],
  arm: [[6, -11, 2, 2, "sleeve"], [7, -9, 2, 3, "sleeve"], [8, -6, 2, 1, "skin"]],
  walkArmBack: [[3, -11, 2, 2, "sleeve2"], [2, -9, 2, 3, "sleeve2"], [1, -6, 2, 1, "skin"]],
  walkArmFront: [[6, -11, 2, 2, "sleeve"], [8, -10, 2, 3, "sleeve"], [9, -7, 2, 1, "skin"]],
  walkLegBack: [[3, -5, 2, 2, "pants2"], [2, -3, 2, 2, "pants2"], [1, -1, 4, 1, "shoe"]],
  walkLegFront: [[7, -5, 2, 2, "pants"], [8, -3, 2, 2, "pants"], [8, -1, 4, 1, "shoe"]],
  walkLegCrossBack: [[4, -5, 2, 2, "pants2"], [5, -3, 2, 2, "pants2"], [6, -1, 4, 1, "shoe"]],
  walkLegCrossFront: [[6, -5, 2, 2, "pants"], [5, -3, 2, 2, "pants"], [3, -1, 4, 1, "shoe"]],
  cup: [[5, -11, 2, 3, "sleeve"], [6, -9, 3, 2, "sleeve"], [9, -12, 2, 3, "cup"], [8, -9, 1, 2, "skin"]],
  armUp: [[10, -17, 2, 6, "sleeve"], [10, -19, 2, 2, "skin"]],
  armUpBack: [[0, -17, 2, 6, "sleeve2"], [0, -19, 2, 2, "skin"]],
  // A box of desk things, carried out the door.
  box: [[5, -11, 2, 3, "sleeve"], [6, -9, 3, 2, "sleeve"], [10, -15, 1, 2, "leaf"], [11, -16, 1, 2, "leaf2"],
    [8, -13, 6, 5, "cardboard"], [8, -13, 6, 1, "cardboardTop"], [9, -9, 1, 1, "skin"]],
  pizza: [[5, -11, 2, 3, "sleeve"], [6, -9, 3, 2, "sleeve"], [8, -10, 8, 2, "pizzaBox"], [8, -12, 8, 2, "pizzaBox"], [9, -11, 4, 1, "pizzaLogo"]],
};

// Headphones and a mic, for agents working from another machine.
const headset = (x, y) => [[x, y - 2, 6, 1, "headset"], [x - 1, y + 2, 2, 3, "headset"], [x, y + 5, 3, 1, "headset"], [x + 3, y + 5, 1, 1, "headsetMic"]];
export const HEADSET = { stand: headset(3, -19), sit: headset(3, -23) };

// Sitting on a seat whose top is 8 units up, facing right.
export const SIT = {
  body: [...head(3, -23), [4, -16, 3, 1, "shirt"], [3, -15, 6, 1, "shirt"], [2, -14, 7, 2, "shirt"],
    [2, -12, 2, 1, "shirtDark"], [4, -12, 5, 1, "shirt"], [4, -16, 1, 1, "collar"], [3, -11, 6, 1, "shirt"],
    [3, -10, 8, 2, "pants"], [9, -8, 3, 6, "pants"], [8, -2, 3, 1, "pants2"], [9, -1, 4, 1, "shoe"]],
  arm: [[5, -16, 2, 2, "sleeve"], [6, -14, 2, 2, "sleeve"], [8, -13, 5, 1, "sleeve"], [13, -13, 2, 1, "skin"]],
  rest: [[5, -16, 2, 5, "sleeve"], [6, -11, 3, 1, "skin"]],
  lapArm: [[5, -16, 2, 3, "sleeve"], [6, -13, 4, 2, "sleeve"], [10, -13, 1, 1, "skin"]],
  laptop: [[7, -11, 6, 1, "laptop"], [12, -16, 1, 5, "laptop"], [11, -15, 1, 3, "laptopScreen"]],
  stool: [[2, -8, 8, 1, "stool"], [3, -7, 1, 7, "stoolLeg"], [8, -7, 1, 7, "stoolLeg"]],
};

// 32×60 source art. The old shapes are retained as a readable base and the
// one-grid-pixel accents are authored at the new resolution instead of scaling
// the rendered sprite. Every part still ends at the same y=0 baseline.
const hi = (list, accents = []) => [
  ...list.map(([x, y, w, h, c]) => [x * 2, y * 2, w * 2, h * 2, c]),
  ...accents,
];

export const PERSON_HIRES = new Map([
  [STAND.body, hi(STAND.body, [
    [8, -39, 6, 1, "hairHi"], [10, -35, 1, 1, "hairHi"], [14, -34, 1, 1, "skin"],
    [9, -32, 1, 1, "eye"], [15, -31, 1, 1, "skin"], [7, -25, 1, 3, "shirtDark"],
    [16, -22, 1, 4, "collar"], [20, -19, 1, 5, "shirtDark"], [7, -13, 1, 1, "belt"],
  ])],
  [STAND.backLeg, hi(STAND.backLeg, [[5, -9, 1, 4, "pants2"], [3, -2, 6, 1, "shoe"]])],
  [STAND.frontLeg, hi(STAND.frontLeg, [[15, -9, 1, 4, "pants"], [16, -2, 7, 1, "shoe"]])],
  [STAND.arm, hi(STAND.arm, [[13, -20, 1, 4, "sleeve"], [17, -13, 1, 2, "skin"]])],
  [STAND.walkArmBack, hi(STAND.walkArmBack, [[5, -20, 1, 4, "sleeve2"], [2, -12, 1, 2, "skin"]])],
  [STAND.walkArmFront, hi(STAND.walkArmFront, [[15, -20, 1, 4, "sleeve"], [19, -14, 1, 2, "skin"]])],
  [STAND.walkLegBack, hi(STAND.walkLegBack, [[5, -9, 1, 4, "pants2"], [3, -2, 7, 1, "shoe"]])],
  [STAND.walkLegFront, hi(STAND.walkLegFront, [[15, -9, 1, 4, "pants"], [17, -2, 7, 1, "shoe"]])],
  [STAND.walkLegCrossBack, hi(STAND.walkLegCrossBack, [[9, -9, 1, 4, "pants2"], [13, -2, 7, 1, "shoe"]])],
  [STAND.walkLegCrossFront, hi(STAND.walkLegCrossFront, [[11, -9, 1, 4, "pants"], [7, -2, 7, 1, "shoe"]])],
  [STAND.armUp, hi(STAND.armUp, [[21, -34, 1, 5, "sleeve"], [21, -39, 1, 2, "skin"]])],
  [STAND.armUpBack, hi(STAND.armUpBack, [[1, -34, 1, 5, "sleeve2"], [1, -39, 1, 2, "skin"]])],
  [STAND.cup, hi(STAND.cup, [[18, -24, 1, 3, "cup"]])],
  [STAND.box, hi(STAND.box, [[20, -27, 1, 3, "cardboardTop"]])],
  [STAND.pizza, hi(STAND.pizza, [[18, -23, 1, 1, "pizzaLogo"]])],
  [SIT.body, hi(SIT.body, [
    [8, -47, 6, 1, "hairHi"], [10, -43, 1, 1, "hairHi"], [14, -42, 1, 1, "skin"],
    [9, -40, 1, 1, "eye"], [15, -39, 1, 1, "skin"], [7, -29, 1, 3, "shirtDark"],
    [16, -26, 1, 4, "collar"], [20, -22, 1, 4, "shirtDark"], [7, -19, 1, 1, "pants2"],
  ])],
  [SIT.arm, hi(SIT.arm, [[11, -30, 1, 4, "sleeve"], [17, -24, 1, 2, "skin"]])],
  [SIT.rest, hi(SIT.rest, [[11, -30, 1, 8, "sleeve"]])],
  [SIT.lapArm, hi(SIT.lapArm, [[11, -30, 1, 5, "sleeve"], [19, -25, 1, 2, "skin"]])],
  [SIT.laptop, hi(SIT.laptop, [[15, -31, 1, 5, "laptopScreen"]])],
]);

