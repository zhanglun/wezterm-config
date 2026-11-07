// Shared colors and deterministic agent appearance.

export const PALETTE = {
  chair: "#3d4a6b", chairLeg: "#2a3149", hairHi: "#d9d4c8", collar: "#ffffff",
  deskTop: "#a0683f", deskEdge: "#7d4f2e", deskLeg: "#5c3a22", deskSide: "#8a5a35", handle: "#d9b37c",
  kbd: "#d9dde3", mon: "#2b2f3a", mug: "#c9b79c", lamp: "#3b3b44", lampShade: "#2f7a6a",
  bell: "#e0b43d", bellBase: "#6b5a2a",
  coolerBody: "#e9eef3", coolerShade: "#c3ccd6", tapRed: "#e05252", tapBlue: "#3d8be0",
  water: "#8fd0f5", waterHi: "#d6f0ff", cap: "#3d8be0", cupStack: "#ffffff",
  counter: "#7d6a58", counterTop: "#d8d2c8", counterLine: "#5e4f41",
  coffee: "#2d2d33", coffeeLight: "#58c26b", coffeeShade: "#18181c", mug2: "#e07a5f", tray: "#6b6b75",
  couch: "#5b6fb5", couchBack: "#4c5f9e", couchShade: "#3e4e85", cushion: "#e0b43d",
  leaf: "#3f9a55", leaf2: "#2f7a43", pot: "#c0643f", potRim: "#a3502f",
  eye: "#1d1d24", cup: "#ffffff", belt: "#3a2c22", shoe: "#2a2420",
  laptop: "#9aa3ad", laptopScreen: "#7fd1b9", stool: "#6b4a30", stoolLeg: "#3b2a1e",
  cardboard: "#c9995b", cardboardTop: "#a87c43", headset: "#2b2b33", headsetMic: "#e05252",
  pizzaBox: "#e2d3b5", pizzaBoxShade: "#bfae8c", pizzaLogo: "#c0392b", pizza: "#f2c14e", pepperoni: "#c0392b", pizzaCrust: "#d9a441",
  pumpkin: "#e8761e", pumpkinShade: "#c45f12", stem: "#5a7a2a", pumpkinFace: "#ffd76a",
  tree: "#2f7a43", tree2: "#3f9a55", trunk: "#6b4a30", star: "#ffd76a", ornRed: "#e05252", ornBlue: "#3d8be0", ornGold: "#e0b43d",
  cat: "#e39b4a", catLight: "#f5d3a3", catStripe: "#b86f2c", catEye: "#2a2a2a",
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
    skin: pick(SKINS, 3), hair: pick(HAIRS, 9), hairHi: shade(pick(HAIRS, 9), 1.35),
    shirt, sleeve: shade(shirt, 0.88), sleeve2: shade(shirt, 0.72), collar: shade(shirt, 1.18), shirtDark: shade(shirt, 0.68),
    pants, pants2: shade(pants, 0.75), salt: h,
  };
}

// The pizza delivery: red cap, red shirt.
export const COURIER = {
  ...PALETTE, skin: "#c98d5f", hair: "#c0392b", shirt: "#d94a3a", sleeve: "#c03f31", sleeve2: "#a33428",
  pants: "#2b2f3a", pants2: "#20232b", salt: 11,
};
