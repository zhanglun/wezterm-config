// Pixel-art rects use a top-origin frame: [x, y, width, height, color].
export const SPRITE_HEIGHT = 30;

// People face right; the left-facing ones are mirrored in a box PERSON wide.
export const PERSON_FRAME = { width: 16, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT };

export const STAND = {
  "body": [
    [
      3,
      9,
      6,
      7,
      "skin"
    ],
    [
      9,
      12,
      1,
      1,
      "skin"
    ],
    [
      7,
      11,
      1,
      2,
      "eye"
    ],
    [
      2,
      8,
      7,
      3,
      "hair"
    ],
    [3, 8, 3, 1, "hairHi"],
    [
      2,
      11,
      2,
      3,
      "hair"
    ],
    [
      4,
      16,
      4,
      1,
      "skin"
    ],
    [
      3,
      17,
      6,
      6,
      "shirt"
    ],
    [4, 17, 1, 4, "shirtHi"], [8, 19, 1, 3, "shirtShade"],
    [
      3,
      22,
      6,
      1,
      "belt"
    ]
  ],
  "backLeg": [
    [
      4,
      22,
      2,
      7,
      "pants2"
    ],
    [4, 23, 1, 4, "pantsHi"],
    [
      4,
      29,
      3,
      1,
      "shoe"
    ]
  ],
  "frontLeg": [
    [
      6,
      22,
      2,
      7,
      "pants"
    ],
    [6, 23, 1, 4, "pantsHi"],
    [
      6,
      29,
      3,
      1,
      "shoe"
    ]
  ],
  "arm": [
    [
      5,
      17,
      2,
      5,
      "sleeve"
    ],
    [
      5,
      22,
      2,
      1,
      "skin"
    ]
  ],
  "cup": [
    [
      5,
      17,
      2,
      3,
      "sleeve"
    ],
    [
      6,
      19,
      3,
      2,
      "sleeve"
    ],
    [
      9,
      16,
      2,
      3,
      "cup"
    ],
    [
      8,
      19,
      1,
      2,
      "skin"
    ]
  ],
  "armUp": [
    [
      10,
      11,
      2,
      6,
      "sleeve"
    ],
    [
      10,
      9,
      2,
      2,
      "skin"
    ]
  ],
  "armUpBack": [
    [
      0,
      11,
      2,
      6,
      "sleeve2"
    ],
    [
      0,
      9,
      2,
      2,
      "skin"
    ]
  ],
  "box": [
    [
      5,
      17,
      2,
      3,
      "sleeve"
    ],
    [
      6,
      19,
      3,
      2,
      "sleeve"
    ],
    [
      10,
      13,
      1,
      2,
      "leaf"
    ],
    [
      11,
      12,
      1,
      2,
      "leaf2"
    ],
    [
      8,
      15,
      6,
      5,
      "cardboard"
    ],
    [
      8,
      15,
      6,
      1,
      "cardboardTop"
    ],
    [
      9,
      19,
      1,
      1,
      "skin"
    ]
  ],
  "pizza": [
    [
      5,
      17,
      2,
      3,
      "sleeve"
    ],
    [
      6,
      19,
      3,
      2,
      "sleeve"
    ],
    [
      8,
      18,
      8,
      2,
      "pizzaBox"
    ],
    [
      8,
      16,
      8,
      2,
      "pizzaBox"
    ],
    [
      9,
      17,
      4,
      1,
      "pizzaLogo"
    ]
  ]
};

// Headphones and a mic, for agents working from another machine.
export const HEADSET = {
  "stand": [
    [
      3,
      9,
      6,
      1,
      "headset"
    ],
    [
      2,
      13,
      2,
      3,
      "headset"
    ],
    [
      3,
      16,
      3,
      1,
      "headset"
    ],
    [
      6,
      16,
      1,
      1,
      "headsetMic"
    ]
  ],
  "sit": [
    [
      3,
      5,
      6,
      1,
      "headset"
    ],
    [
      2,
      9,
      2,
      3,
      "headset"
    ],
    [
      3,
      12,
      3,
      1,
      "headset"
    ],
    [
      6,
      12,
      1,
      1,
      "headsetMic"
    ]
  ]
};

// Sitting on a seat whose top is 8 units up, facing right.
export const SIT = {
  "body": [
    [
      3,
      7,
      6,
      7,
      "skin"
    ],
    [8, 9, 1, 3, "skinHi"],
    [
      9,
      10,
      1,
      1,
      "skin"
    ],
    [
      7,
      9,
      1,
      2,
      "eye"
    ],
    [
      2,
      6,
      7,
      3,
      "hair"
    ],
    [3, 6, 3, 1, "hairHi"],
    [
      2,
      9,
      2,
      3,
      "hair"
    ],
    [
      3,
      14,
      6,
      6,
      "shirt"
    ],
    [4, 14, 1, 4, "shirtHi"], [8, 16, 1, 3, "shirtShade"],
    [
      3,
      20,
      8,
      2,
      "pants"
    ],
    [
      10,
      22,
      2,
      5,
      "pants"
    ],
    [
      10,
      27,
      3,
      1,
      "shoe"
    ]
  ],
  "arm": [
    [
      5,
      14,
      2,
      3,
      "sleeve"
    ],
    [
      6,
      16,
      7,
      2,
      "sleeve"
    ],
    [
      13,
      16,
      2,
      1,
      "skin"
    ]
  ],
  "rest": [
    [
      5,
      14,
      2,
      5,
      "sleeve"
    ],
    [
      6,
      19,
      3,
      1,
      "skin"
    ]
  ],
  "lapArm": [
    [
      5,
      14,
      2,
      3,
      "sleeve"
    ],
    [
      6,
      17,
      4,
      2,
      "sleeve"
    ],
    [
      10,
      17,
      1,
      1,
      "skin"
    ]
  ],
  "laptop": [
    [
      7,
      19,
      6,
      1,
      "laptop"
    ],
    [
      12,
      14,
      1,
      5,
      "laptop"
    ],
    [
      11,
      15,
      1,
      3,
      "laptopScreen"
    ]
  ],
  "stool": [
    [
      2,
      22,
      8,
      1,
      "stool"
    ],
    [
      3,
      23,
      1,
      7,
      "stoolLeg"
    ],
    [
      8,
      23,
      1,
      7,
      "stoolLeg"
    ]
  ]
};

export const SLOT = 48; // scene spacing between desk anchors
// Top-origin frames migrated from the original desk art. The art is unchanged.
export const CHAIR_SPRITE = {
  frame: { width: SLOT, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [
    [0, 12, 2, 10, "chair"], [1, 13, 1, 8, "chairHi"],
    [0, 22, 8, 2, "chair"], [1, 22, 6, 1, "chairHi"], [6, 23, 2, 1, "chairShadow"],
    [3, 24, 2, 5, "chairLeg"], [4, 24, 1, 5, "chairLegHi"], [1, 29, 6, 1, "chairLeg"],
  ],
};
export const BELL_SPRITE = {
  frame: { width: SLOT, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[18, 15, 3, 2, "bell"], [19, 14, 1, 1, "bell"], [18, 17, 3, 1, "bellBase"]],
};
export const DESK_SPRITE = {
  frame: { width: SLOT, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [
    [10, 18, 26, 2, "deskTop"], [11, 18, 24, 1, "deskTopHi"],
    [10, 20, 26, 1, "deskEdge"], [11, 20, 24, 1, "deskEdgeHi"],
    [13, 21, 2, 9, "deskLeg"], [13, 21, 1, 8, "deskLegHi"],
    [33, 21, 2, 9, "deskLeg"], [33, 21, 1, 8, "deskLegHi"],
    [24, 21, 8, 6, "deskSide"], [25, 21, 6, 1, "deskSideHi"], [31, 22, 1, 4, "deskSideShade"],
    [26, 23, 3, 1, "handle"], [26, 23, 2, 1, "handleHi"],
    [12, 17, 5, 1, "kbd"], [13, 17, 1, 1, "kbdKey"], [15, 17, 1, 1, "kbdKey"],
    [21, 6, 12, 10, "mon"], [22, 7, 10, 1, "monHi"], [21, 7, 1, 9, "monSide"],
    [26, 16, 2, 1, "monStand"], [25, 17, 4, 1, "monStand"],
    [24, 17, 6, 1, "mug"], [24, 17, 1, 1, "mugHi"], [9, 16, 1, 1, "mug"],
    [33, 17, 3, 1, "lamp"], [33, 17, 2, 1, "lampHi"], [34, 11, 1, 6, "lamp"],
    [34, 11, 1, 5, "lampHi"], [33, 8, 4, 3, "lampShade"], [33, 8, 3, 1, "lampShadeHi"],
  ],
  screen: [22, 7, 10, 8],
  bulb: [33, 11, 4, 1],
};

export const PIZZA_BOX_SPRITE = {
  frame: { width: 22, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[11, 12, 9, 6, "pizzaBox"], [13, 14, 5, 2, "pizzaLogo"], [11, 18, 9, 1, "pizzaBoxShade"], [12, 17, 7, 1, "pizza"], [13, 17, 1, 1, "pepperoni"], [16, 17, 1, 1, "pepperoni"], [18, 17, 1, 1, "pizzaCrust"]],
};
export const MUG_PILE_SPRITE = {
  frame: { width: SLOT, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[10, 14, 2, 2, "mug2"], [10, 12, 2, 2, "cup"], [11, 10, 2, 2, "mug2"]],
};
export const PUMPKIN_SPRITE = {
  frame: { width: 8, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[3, 23, 1, 1, "stem"], [1, 24, 6, 1, "pumpkin"], [0, 25, 8, 5, "pumpkin"], [2, 25, 1, 5, "pumpkinShade"], [5, 25, 1, 5, "pumpkinShade"], [1, 26, 2, 1, "pumpkinFace"], [5, 26, 2, 1, "pumpkinFace"], [2, 28, 4, 1, "pumpkinFace"]],
};
export const TREE_SPRITE = {
  frame: { width: 16, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[7, 4, 2, 2, "star"], [6, 6, 4, 4, "tree"], [4, 10, 8, 5, "tree2"], [2, 15, 12, 6, "tree"], [1, 21, 14, 4, "tree2"], [7, 25, 2, 3, "trunk"], [5, 28, 6, 2, "pot"], [5, 12, 1, 1, "ornRed"], [9, 17, 1, 1, "ornBlue"], [4, 19, 1, 1, "ornGold"], [11, 22, 1, 1, "ornRed"], [7, 9, 1, 1, "ornGold"], [12, 18, 1, 1, "ornGold"], [3, 23, 1, 1, "ornBlue"]],
};
export const COUCH_SPRITE = {
  frame: { width: 34, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[2, 15, 30, 7, "couchBack"], [3, 15, 28, 1, "couchHi"], [0, 19, 4, 10, "couch"], [0, 19, 1, 9, "couchHi"], [30, 19, 4, 10, "couch"], [30, 19, 1, 9, "couchHi"], [3, 22, 28, 3, "couch"], [4, 22, 26, 1, "couchHi"], [3, 25, 28, 4, "couchShade"], [16, 22, 1, 3, "couchShade"], [3, 29, 2, 1, "deskLeg"], [29, 29, 2, 1, "deskLeg"], [6, 17, 5, 4, "cushion"], [7, 17, 3, 1, "cushionHi"]],
};
export const COOLER_SPRITE = {
  frame: { width: 10, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[1, 16, 8, 14, "coolerBody"], [2, 16, 1, 12, "coolerHi"], [7, 16, 2, 14, "coolerShade"], [1, 29, 8, 1, "coolerShade"], [3, 20, 4, 2, "coolerShade"], [3, 19, 1, 1, "tapRed"], [6, 19, 1, 1, "tapBlue"], [2, 8, 6, 8, "water"], [3, 9, 1, 5, "waterHi"], [4, 7, 2, 1, "cap"], [9, 18, 1, 6, "cupStack"], [9, 18, 1, 1, "cupHi"]],
};
export const COUNTER_SPRITE = {
  frame: { width: 22, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [[0, 19, 22, 1, "counterTop"], [1, 19, 20, 1, "counterTopHi"], [0, 20, 22, 10, "counter"], [1, 21, 9, 1, "counterHi"], [10, 20, 1, 10, "counterLine"], [3, 23, 4, 1, "handle"], [14, 23, 4, 1, "handle"], [2, 11, 7, 8, "coffee"], [3, 12, 5, 2, "coffeeLight"], [4, 16, 3, 1, "coffeeShade"], [4, 17, 2, 2, "cup"], [12, 16, 3, 3, "mug2"], [16, 17, 2, 2, "cup"], [11, 18, 9, 1, "tray"]],
};
export const PLANT_SPRITE = {
  frame: { width: 9, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT },
  rects: [
    // Stems and leaves: stepped silhouettes leave small gaps between the branches.
    [4, 10, 1, 14, "leaf2"], [2, 13, 1, 11, "leaf2"], [6, 12, 1, 12, "leaf2"],
    [1, 13, 3, 2, "leaf"], [0, 15, 3, 3, "leaf2"], [2, 18, 3, 3, "leaf"],
    [5, 13, 3, 2, "leaf"], [6, 15, 3, 3, "leaf2"], [4, 18, 3, 3, "leaf"],
    [1, 20, 2, 2, "leaf2"], [6, 20, 2, 2, "leaf2"], [3, 21, 2, 3, "leaf2"],
    [2, 13, 1, 1, "leafHi"], [1, 16, 1, 1, "leafHi"], [2, 18, 1, 1, "leafHi"],
    [5, 13, 1, 1, "leafHi"], [7, 16, 1, 1, "leafHi"], [5, 18, 1, 1, "leafHi"], [6, 20, 1, 1, "leafHi"],
    // Two tiny blossoms, kept inside the original frame.
    [2, 8, 3, 1, "flower"], [1, 9, 1, 1, "flower"], [3, 9, 1, 1, "flower"], [2, 10, 2, 1, "flower"], [2, 9, 1, 1, "flowerHi"],
    [6, 7, 2, 1, "flower"], [5, 8, 1, 1, "flower"], [7, 8, 1, 1, "flower"], [6, 9, 2, 1, "flower"], [6, 8, 1, 1, "flowerHi"],
    [1, 23, 7, 1, "potRim"], [2, 24, 5, 6, "pot"], [2, 25, 1, 4, "potRim"], [6, 25, 1, 5, "potRim"], [3, 29, 3, 1, "potShade"],
  ],
};

export const CAT_FRAME = { width: 14, height: SPRITE_HEIGHT, anchorX: 0, anchorY: SPRITE_HEIGHT };
export const KITTY = {
  "body": [
    [
      0,
      22,
      1,
      4,
      "cat"
    ],
    [
      1,
      25,
      1,
      1,
      "cat"
    ],
    [
      2,
      25,
      8,
      3,
      "cat"
    ],
    [
      4,
      25,
      1,
      3,
      "catStripe"
    ],
    [
      6,
      25,
      1,
      3,
      "catStripe"
    ],
    [
      3,
      27,
      6,
      1,
      "catLight"
    ],
    [4, 25, 1, 1, "catHi"], [7, 25, 1, 1, "catHi"],
    [
      9,
      23,
      4,
      4,
      "cat"
    ],
    [9, 21, 2, 2, "cat"], [11, 22, 2, 2, "cat"], [10, 23, 1, 1, "catLight"],
    [
      9,
      22,
      1,
      1,
      "cat"
    ],
    [
      12,
      22,
      1,
      1,
      "cat"
    ],
    [
      11,
      24,
      1,
      1,
      "catEye"
    ],
    [
      12,
      26,
      1,
      1,
      "catLight"
    ]
  ],
  "legsA": [
    [
      3,
      28,
      1,
      2,
      "catStripe"
    ],
    [
      8,
      28,
      1,
      2,
      "cat"
    ]
  ],
  "legsB": [
    [
      5,
      28,
      1,
      2,
      "cat"
    ],
    [
      9,
      28,
      1,
      2,
      "catStripe"
    ]
  ],
  "sit": [
    [
      1,
      28,
      4,
      1,
      "cat"
    ],
    [
      1,
      27,
      1,
      1,
      "cat"
    ],
    [
      4,
      24,
      5,
      6,
      "cat"
    ],
    [
      5,
      26,
      3,
      3,
      "catLight"
    ],
    [
      6,
      20,
      4,
      4,
      "cat"
    ],
    [6, 18, 2, 2, "cat"], [8, 19, 2, 1, "cat"], [7, 21, 1, 1, "catLight"],
    [
      6,
      19,
      1,
      1,
      "cat"
    ],
    [
      9,
      19,
      1,
      1,
      "cat"
    ],
    [
      8,
      21,
      1,
      1,
      "catEye"
    ],
    [
      5,
      24,
      1,
      2,
      "catStripe"
    ]
  ],
  "sleep": [
    [
      1,
      28,
      3,
      1,
      "cat"
    ],
    [
      2,
      26,
      9,
      4,
      "cat"
    ],
    [3, 25, 2, 1, "catHi"], [7, 25, 2, 1, "catHi"],
    [
      4,
      26,
      1,
      3,
      "catStripe"
    ],
    [
      6,
      26,
      1,
      3,
      "catStripe"
    ],
    [
      8,
      25,
      4,
      3,
      "cat"
    ],
    [
      8,
      24,
      1,
      1,
      "cat"
    ],
    [
      11,
      24,
      1,
      1,
      "cat"
    ],
    [
      9,
      26,
      2,
      1,
      "catStripe"
    ]
  ]
};

export const PALETTE = {
  chair: "#3d4a6b", chairHi: "#53658e", chairShadow: "#2a3149", chairLeg: "#2a3149", chairLegHi: "#465577",
  deskTop: "#a0683f", deskTopHi: "#bd8050", deskEdge: "#7d4f2e", deskEdgeHi: "#9a6138", deskLeg: "#5c3a22", deskLegHi: "#76502f", deskSide: "#8a5a35", deskSideHi: "#a96b40", deskSideShade: "#684329", handle: "#d9b37c", handleHi: "#f0cf91",
  kbd: "#d9dde3", kbdKey: "#f6f0d9", mon: "#2b2f3a", monHi: "#596474", monSide: "#1e2430", monStand: "#596474", mug: "#c9b79c", mugHi: "#eee0c0", lamp: "#3b3b44", lampHi: "#6c7074", lampShade: "#2f7a6a", lampShadeHi: "#4b9a87",
  bell: "#e0b43d", bellBase: "#6b5a2a",
  tapRed: "#e05252", tapBlue: "#3d8be0",
  water: "#8fd0f5", waterHi: "#d6f0ff", cap: "#3d8be0", cupStack: "#ffffff", cupHi: "#ffffff",
  coffee: "#2d2d33", coffeeLight: "#58c26b", coffeeShade: "#18181c", mug2: "#e07a5f", tray: "#6b6b75",
  couch: "#5b6fb5", couchBack: "#4c5f9e", couchShade: "#3e4e85", couchHi: "#7085d0", cushion: "#e0b43d", cushionHi: "#f0ca54",
  coolerBody: "#dce3df", coolerShade: "#aeb9b5", coolerHi: "#f7f4e8",
  counter: "#76685d", counterTop: "#c8bfae", counterLine: "#514940", counterTopHi: "#e7dfcf", counterHi: "#958372",
  leaf: "#4fb866", leaf2: "#2b7541", leafHi: "#78d37a", flower: "#e05c8c", flowerHi: "#ffd76a", pot: "#c0643f", potRim: "#e07a5f", potShade: "#8f432f",
  eye: "#1d1d24", cup: "#ffffff", belt: "#3a2c22", shoe: "#2a2420",
  laptop: "#9aa3ad", laptopScreen: "#7fd1b9", stool: "#6b4a30", stoolLeg: "#3b2a1e",
  cardboard: "#c9995b", cardboardTop: "#a87c43", headset: "#2b2b33", headsetMic: "#e05252",
  pizzaBox: "#e2d3b5", pizzaBoxShade: "#bfae8c", pizzaLogo: "#c0392b", pizza: "#f2c14e", pepperoni: "#c0392b", pizzaCrust: "#d9a441",
  pumpkin: "#e8761e", pumpkinShade: "#c45f12", stem: "#5a7a2a", pumpkinFace: "#ffd76a",
  tree: "#2f7a43", tree2: "#3f9a55", trunk: "#6b4a30", star: "#ffd76a", ornRed: "#e05252", ornBlue: "#3d8be0", ornGold: "#e0b43d",
  skinHi: "#ffe0be", hairHi: "#8a5c3b", shirtHi: "#f09578", shirtShade: "#b95749", pantsHi: "#536887",
  cat: "#e39b4a", catLight: "#f5d3a3", catHi: "#ffd9a0", catStripe: "#b86f2c", catEye: "#2a2a2a",
};

// Mugs by agent program: who drinks from what.
export const MUGS = { claude: "#d97757", codex: "#e8e8e8", gemini: "#4f86f7", cursor: "#2b2b2b", opencode: "#58b368", amp: "#9b6bdc" };

export const SKINS = ["#f6d2b0", "#e8b48a", "#c98d5f", "#9a6440", "#6e452b"];
export const HAIRS = ["#2a1c14", "#5a3520", "#c99640", "#1b1b1f", "#a8432d", "#d9d4c8", "#4b5bd6"];
export const SHIRTS = ["#e07a5f", "#3d8be0", "#58b368", "#9b6bdc", "#e0b43d", "#e05c8c", "#2fb3a8", "#f08c3a"];
export const PANTS = ["#2f3b55", "#3b3b44", "#4a3a2c", "#24425a"];

export const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

// A person's colors, the same every time for the same terminal.
export function look(address) {
  let h = 2166136261;
  for (const ch of address) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const pick = (list, salt) => list[(((h >>> salt) ^ (h >>> (salt + 7))) >>> 0) % list.length];
  const shirt = pick(SHIRTS, 0), pants = pick(PANTS, 5);
  return {
    ...PALETTE,
    skin: pick(SKINS, 3), hair: pick(HAIRS, 9), shirt, sleeve: shade(shirt, 0.88), sleeve2: shade(shirt, 0.72),
    pants, pants2: shade(pants, 0.75), salt: h,
  };
}

// The pizza delivery: red cap, red shirt.
export const COURIER = {
  ...PALETTE, skin: "#c98d5f", hair: "#c0392b", shirt: "#d94a3a", sleeve: "#c03f31", sleeve2: "#a33428",
  pants: "#2b2f3a", pants2: "#20232b", salt: 11,
};
