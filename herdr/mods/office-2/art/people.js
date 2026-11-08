// People: standing, sitting, and headset parts.
import { mirror } from "./render.js";

// People face right; the left-facing ones are mirrored in a box PERSON wide.
export const PERSON = 16;

const head = (x, y) => [
  [x, y, 6, 7, "skin"],
  [x + 6, y + 3, 1, 1, "skin"], // nose
  [x + 4, y + 2, 1, 2, "eye"],
  [x - 1, y - 1, 7, 3, "hair"],
  [x - 1, y + 2, 2, 3, "hair"],
];

export const STAND = {
  body: [...head(3, -19), [4, -12, 4, 1, "skin"], [3, -11, 6, 6, "shirt"], [3, -6, 6, 1, "belt"]],
  backLeg: [[4, -5, 2, 4, "pants2"], [4, -1, 3, 1, "shoe"]],
  frontLeg: [[6, -5, 2, 4, "pants"], [6, -1, 3, 1, "shoe"]],
  arm: [[5, -11, 2, 5, "sleeve"], [5, -6, 2, 1, "skin"]],
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
  body: [...head(3, -23), [3, -16, 6, 6, "shirt"], [3, -10, 8, 2, "pants"], [10, -8, 2, 7, "pants"], [10, -1, 3, 1, "shoe"]],
  arm: [[5, -16, 2, 3, "sleeve"], [6, -14, 7, 2, "sleeve"], [13, -14, 2, 1, "skin"]],
  rest: [[5, -16, 2, 5, "sleeve"], [6, -11, 3, 1, "skin"]],
  lapArm: [[5, -16, 2, 3, "sleeve"], [6, -13, 4, 2, "sleeve"], [10, -13, 1, 1, "skin"]],
  laptop: [[7, -11, 6, 1, "laptop"], [12, -16, 1, 5, "laptop"], [11, -15, 1, 3, "laptopScreen"]],
  stool: [[2, -8, 8, 1, "stool"], [3, -7, 1, 7, "stoolLeg"], [8, -7, 1, 7, "stoolLeg"]],
};

export { mirror };
