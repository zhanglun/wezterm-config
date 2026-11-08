// Fixed office fixtures: the desk, its chair, and per-desk small props.

export const SLOT = 48; // units per desk
export const DESK = {
  chair: [[0, -18, 2, 10, "chair"], [0, -8, 8, 2, "chair"], [3, -6, 2, 5, "chairLeg"], [1, -1, 6, 1, "chairLeg"]],
  desk: [
    [10, -12, 26, 2, "deskTop"], [10, -10, 26, 1, "deskEdge"],
    [13, -9, 2, 9, "deskLeg"], [33, -9, 2, 9, "deskLeg"],
    [24, -9, 8, 6, "deskSide"], [26, -7, 3, 1, "handle"],
    [12, -13, 5, 1, "kbd"],
    [21, -24, 12, 10, "mon"], [26, -14, 2, 1, "mon"], [24, -13, 6, 1, "mon"],
    [10, -14, 2, 2, "mug"], [9, -14, 1, 1, "mug"],
    [33, -13, 3, 1, "lamp"], [34, -19, 1, 6, "lamp"], [33, -22, 4, 3, "lampShade"],
  ],
  bell: [[18, -15, 3, 2, "bell"], [19, -16, 1, 1, "bell"], [18, -13, 3, 1, "bellBase"]],
  screen: [22, -23, 10, 8], // drawn by the scene: it changes with the agent
  bulb: [33, -19, 4, 1],
};

