// Native Herdr/GPUI gallery for office-2. Every tile below is made from the same
// art and decor helpers used by the live office mod; this is not a browser mock.
import { View, div } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import * as A from "./art.js";
import * as D from "./decor.js";

const STATUS = {
  working: "#3d8be0",
  blocked: "#e05252",
  done: "#58c26b",
  idle: "#9aa0aa",
};
const LABEL = { working: "WORKING", blocked: "BLOCKED", done: "DONE", idle: "IDLE" };
const statuses = Object.keys(STATUS);
const samplePalettes = ["preview/alice", "preview/ben", "preview/cara", "preview/drew"];
const EDITABLE = ["person", "desk", "couch", "cooler", "counter", "plant", "cat", "pizza"];

function button(id, label, active, action) {
  return div().id(id).px(10).py(7).rounded(4).bg(active ? "#2c4a53" : "#242c38")
    .border_1().border_color(active ? "#58c2b0" : "#3a4655").text_size(11)
    .text_color(active ? "#f5fff8" : "#aeb9c6").cursor_pointer().on_click(action).child(label);
}

function panel(title, body) {
  return v_flex().gap(9).p(14).rounded(5).bg("#1b222d").border_1().border_color("#354252")
    .child(div().text_size(13).font_bold().text_color("#e9eef3").child(title)).child(body);
}

function swatch(status) {
  return div().size(8).rounded_full().bg(STATUS[status]);
}

export default class OfficePreview extends View {
  init(_props, cx) {
    this.status = "working";
    this.now = new Date();
    this.edit = { target: "person", scale: 4, x: 0, y: 0 };
    cx.timer.every(30000, (cx) => { this.now = new Date(); cx.notify(); });
  }

  person(status, pal, scale = 4) {
    const busy = status === "working";
    const body = busy ? [A.SIT.body, A.SIT.arm, A.SIT.laptop]
      : status === "done" ? [A.STAND.body, A.STAND.backLeg, A.STAND.frontLeg, A.STAND.armUp, A.STAND.armUpBack]
      : status === "blocked" ? [A.STAND.body, A.STAND.backLeg, A.STAND.frontLeg, A.STAND.armUp]
      : [A.SIT.body, A.SIT.rest];
    const sprite = div().absolute().left(34).top(10).w(A.PERSON * scale).h(A.BOX * scale)
      .children(body.map((part) => A.layer(part, pal, A.PERSON, scale)));
    return div().relative().h(132).w(110).bg("#202a37").rounded(4).overflow_hidden()
      .child(div().absolute().left(0).bottom(20).w_full().h(2).bg("#465568"))
      .child(sprite)
      .child(div().absolute().left(8).top(8).flex().items_center().gap(5).text_size(9).font_bold()
        .text_color(STATUS[status]).child(swatch(status)).child(LABEL[status]))
      .when(status === "blocked", (el) => el.child(div().absolute().left(72).top(19).text_size(18).font_bold().text_color("#ff6b6b").child("!")))
      .when(status === "done", (el) => el.child(div().absolute().left(38).top(7).text_size(18).font_bold().text_color("#6be38b").child("✓")))
      .when(status === "idle", (el) => el.child(div().absolute().left(72).top(18).text_size(10).text_color("#c9c2ff").child("zZ")));
  }

  desk(status, pal, _i) {
    const p = 3;
    const screen = { blocked: "#4a1a1e", done: "#143a24", working: "#13263f", idle: "#0b1220" }[status];
    const screenEl = div().absolute().left(6).top(6).w(24).h(18).bg(screen);
    if (status === "working") screenEl.children([
      div().absolute().left(3).top(3).w(15).h(2).bg("#7fd1b9"),
      div().absolute().left(3).top(8).w(20).h(2).bg("#f2b866"),
    ]);
    if (status === "blocked") screenEl.flex().items_center().justify_center().text_size(16).font_bold().text_color("#ff6b6b").child("!");
    if (status === "done") screenEl.flex().items_center().justify_center().text_size(15).font_bold().text_color("#6be38b").child("✓");
    const monitor = div().absolute().left(74).top(30).w(36).h(30).bg("#2b2f3a").child(screenEl);
    const person = this.person(status, pal, 2.5).absolute().left(4).top(0).w(60).h(90).bg("#00000000");
    return div().relative().h(126).w(180).bg("#202a37").rounded(4).overflow_hidden().children([
      div().absolute().left(12).top(83).w(156).h(3).bg("#7d4f2e"),
      div().absolute().left(28).top(85).w(7).h(27).bg("#5c3a22"),
      div().absolute().left(138).top(85).w(7).h(27).bg("#5c3a22"),
      monitor,
      div().absolute().left(38).top(76).w(22).h(4).bg("#d9dde3"),
      ...D.deskAccent(status, p, false, false),
      person,
    ]);
  }

  artTile(name, art, width, height = 128) {
    const p = 4;
    return div().relative().h(height).w(170).bg("#202a37").rounded(4).overflow_hidden()
      .child(div().absolute().left(8).top(8).text_size(9).text_color("#9eabb9").child(name))
      .child(div().absolute().left(42).top(28).w(width * p).h(A.BOX * p).children(A.rects(art.rects, A.PALETTE, p)));
  }

  editButton(label, action, active = false) {
    return button(`edit-${label}`, label, active, (_e, cx) => { action(); cx.notify(); });
  }

  editableArt() {
    const name = this.edit.target;
    if (name === "person") return this.person(this.status, A.look("preview/live"), this.edit.scale)
      .absolute().left(180 + this.edit.x).top(24 + this.edit.y).w(110).h(132).bg("#00000000");
    const data = {
      couch: ["COUCH", A.COUCH], cooler: ["COOLER", A.COOLER], counter: ["COUNTER", A.COUNTER],
      plant: ["PLANT", A.PLANT], cat: ["CAT", { rects: A.KITTY.sit }], pizza: ["PIZZA", { rects: A.PIZZA_BOX }],
    }[name];
    const [label, art] = data;
    const widths = { COUCH: A.COUCH.width, COOLER: A.COOLER.width, COUNTER: A.COUNTER.width, PLANT: A.PLANT.width, CAT: A.CAT, PIZZA: 20 };
    const p = this.edit.scale;
    return div().absolute().left(180 + this.edit.x).top(24 + this.edit.y).w(170).h(128).bg("#202a37").rounded(4).overflow_hidden()
      .child(div().absolute().left(42).top(28).w(widths[label] * p).h(A.BOX * p).children(A.rects(art.rects, A.PALETTE, p)))
      .child(div().absolute().left(8).top(8).text_size(9).text_color("#9eabb9").child(label));
  }

  render(cx) {
    A.setScale(3);
    const current = this.status;
    const pals = samplePalettes.map((name) => A.look(name));
    const edit = this.edit;
    const statusButtons = h_flex().gap(7).children(statuses.map((s) => button(`status-${s}`, LABEL[s], current === s, (_e, cx) => { this.status = s; cx.notify(); })));
    const people = h_flex().gap(10).children(statuses.map((s, i) => this.person(s, pals[i])));
    const desks = h_flex().gap(10).children(statuses.map((s, i) => this.desk(s, pals[i], i)));
    const furniture = h_flex().gap(10).children([
      this.artTile("COUCH", A.COUCH, A.COUCH.width),
      this.artTile("COOLER", A.COOLER, A.COOLER.width),
      this.artTile("COUNTER", A.COUNTER, A.COUNTER.width),
      this.artTile("PLANT", A.PLANT, A.PLANT.width),
    ]);
    const props = h_flex().gap(10).children([
      this.artTile("PUMPKIN", A.PUMPKIN, A.PUMPKIN.width),
      this.artTile("TREE", A.TREE, A.TREE.width, 140),
      this.artTile("CAT", { rects: A.KITTY.sit }, A.CAT),
      this.artTile("PIZZA", { rects: A.PIZZA_BOX }, 20),
    ]);
    const widgets = h_flex().gap(10).children([
      div().relative().w(170).h(126).bg("#202a37").rounded(4).child(D.whiteboard(10, 28, [["#3d8be0", "WORK", 2], ["#58a368", "DONE", 1], ["#e05252", "BLOCK", 1], ["#8a8f99", "BREAK", 2]])),
      div().relative().w(170).h(126).bg("#202a37").rounded(4).child(D.incidentSign(28, 27, 74, 12, current === "blocked")),
      div().relative().w(170).h(126).bg("#202a37").rounded(4).child(D.weatherBoard(10, 28, "12:42", current === "blocked" ? "storm" : "clear", { temp: 18, wind: 12, hum: 58, place: "LOCAL" }, false)),
    ]);
    const editControls = v_flex().gap(9).children([
      h_flex().gap(7).children(EDITABLE.map((name) => this.editButton(name.toUpperCase(), () => {
        this.edit.target = name;
        this.edit.scale = name === "person" ? 4 : 4;
        this.edit.x = 0;
        this.edit.y = 0;
      }, edit.target === name))),
      h_flex().gap(7).children([
        this.editButton("SCALE −", () => { this.edit.scale = Math.max(1, this.edit.scale - 1); }),
        div().px(10).py(7).text_size(11).text_color("#dce6ef").child(`scale ${edit.scale}`),
        this.editButton("SCALE +", () => { this.edit.scale = Math.min(10, this.edit.scale + 1); }),
        this.editButton("X −", () => { this.edit.x -= 8; }),
        this.editButton("X +", () => { this.edit.x += 8; }),
        this.editButton("Y −", () => { this.edit.y -= 8; }),
        this.editButton("Y +", () => { this.edit.y += 8; }),
        this.editButton("RESET", () => { this.edit.x = 0; this.edit.y = 0; this.edit.scale = edit.target === "person" ? 4 : 4; }),
      ]),
    ]);
    const editStage = div().relative().h(190).w(560).bg("#111923").rounded(4).overflow_hidden()
      .child(div().absolute().left(20).top(20).text_size(11).text_color("#8e9aaa").child(`LIVE EDIT · ${edit.target.toUpperCase()} · ${edit.x}, ${edit.y}`))
      .child(div().absolute().left(0).right(0).bottom(32).h(2).bg("#465568"))
      .child(this.editableArt());
    return v_flex().size_full().min_h(0).overflow_y_scrollbar().mode("always").bg("#11161e").text_color("#e9eef3")
      .child(v_flex().gap(15).p(20).children([
        v_flex().gap(4).child(div().text_size(22).font_bold().child("Office-2 native preview"))
          .child(div().text_size(12).text_color("#8e9aaa").child("真实 GPUI mod gallery · art.js / decor.js · no browser mock")),
        panel("Realtime editor — same GPUI render path", h_flex().gap(14).children([v_flex().gap(10).children([editControls, div().text_size(11).text_color("#8e9aaa").child("选择元素后调整 scale / X / Y，预览会立即重绘。")]), editStage])),
        panel("Agent states", statusButtons),
        panel("People — same sprites and palettes", people),
        panel("Desks — status screen and deskAccent()", desks),
        panel("Furniture — art.js rect data", furniture),
        panel("Props — seasonal and pet art", props),
        panel("Decor widgets — same decor helpers", widgets),
        div().text_size(11).text_color("#718094").child("This view is rendered by Herdr/GPUI. Edit office-2 art or decor, reload this mod, and the gallery updates from the same source."),
      ]));
  }
}
