// Wall-mounted and per-desk information widgets: boards, signs, the calendar,
// the employee portrait, the remote-call wall, and the desk status lights.
// weatherBoard shares its weather-kind names with windows.js — change both.
import { div, image } from "gpui-kit";
import { run } from "herdr";
import * as A from "../art.js";

const INK = "#3b3b44";

// CC0 pixel weather pack (32×32 PNG). Keep native size so pixels stay crisp.
const WX_BG = {
  clear: "#8ecdf0", clearNight: "#16214a", partly: "#a7d4ec", partlyNight: "#1a2547",
  clouds: "#c6d8e4", fog: "#b9c6d2", drizzle: "#a3b6c8", rain: "#7d95ad", snow: "#9fb6cc", storm: "#4c5b74",
};
const WX_ICONS = {
  clear: "mods/office-2/icons/sun.png",
  clearNight: "mods/office-2/icons/moon.png",
  partly: "mods/office-2/icons/partly-cloudy.png",
  clouds: "mods/office-2/icons/cloud.png",
  fog: "mods/office-2/icons/fog.png",
  drizzle: "mods/office-2/icons/drizzle.png",
  rain: "mods/office-2/icons/rain.png",
  snow: "mods/office-2/icons/snow.png",
  storm: "mods/office-2/icons/storm.png",
};

function weatherIcon(kind, dark) {
  const bg = dark && kind === "clear" ? WX_BG.clearNight : dark && kind === "partly" ? WX_BG.partlyNight : WX_BG[kind] ?? WX_BG.clouds;
  const icon = kind === "clear" && dark ? WX_ICONS.clearNight : WX_ICONS[kind] ?? WX_ICONS.clouds;
  return div().absolute().left(0).top(0).w(56).h(40).bg(bg).overflow_hidden()
    .flex().items_center().justify_center().child(image(icon).w(32).h(32).flex_none());
}

export function weatherBoard(x, y, timeText, kind, meta, dark) {
  const cond = { clear: "CLEAR", partly: "PARTLY", clouds: "CLOUDY", fog: "FOG", drizzle: "DRIZZLE", rain: "RAIN", snow: "SNOW", storm: "STORM" }[kind] ?? "WEATHER";
  const temp = meta?.temp == null ? "--°" : `${meta.temp}°C`;
  const wind = meta?.wind == null ? null : `${meta.wind} km/h`;
  const hum = meta?.hum == null ? null : `${meta.hum}%`;
  const place = meta?.place ?? "LOCAL";
  return div().absolute().left(x).top(y).w(150).rounded(3).overflow_hidden().border_2().border_color("#84958b")
    .child(div().w_full().h(20).px(6).bg("#3a5a48").flex().items_center().justify_between().text_color("#eef5f0")
      .child(div().truncate().text_size(8).font_bold().child(place))
      .child(div().text_size(10).font_bold().child(timeText)))
    .child(div().flex().items_center().gap(8).p(6).bg("#eef2ed")
      .child(div().w(56).h(40).relative().overflow_hidden().rounded(3).child(weatherIcon(kind, dark)))
      .child(div().flex_1().flex().flex_col().gap(3)
        .child(div().flex().items_end().gap(4)
          .child(div().text_size(19).font_bold().text_color("#1d1d24").child(temp))
          .child(div().text_size(8).font_bold().text_color("#5a6b5f").pb(1).child(cond)))
        .child(div().text_size(8).text_color("#6b7a72").child([wind, hum].filter(Boolean).join(" · ") || "—"))));
}
export function deskAccent(status, P, away, overtime) {
  if (!status || away) return [];
  if (status === "blocked") return [
    div().absolute().left(36 * P).top((A.BOX - 25) * P).size(4 * P).rounded_full().bg("#ff4d55")
      .loop("opacity", { from: 0.25, to: 1, period: 650 }),
    div().absolute().left(34 * P).top((A.BOX - 27) * P).w(8 * P).h(8 * P).rounded_full().bg("#ff4d55").opacity(0.11),
  ];
  if (status === "done") return [
    div().absolute().left(36 * P).top((A.BOX - 25) * P).size(3 * P).rounded_full().bg("#6be38b"),
  ];
  if (overtime) return [
    div().absolute().left(8 * P).top((A.BOX - 23) * P).w(3 * P).h(2 * P).bg("#e07a5f"),
  ];
  return [div().absolute().left(36 * P).top((A.BOX - 25) * P).size(2 * P).rounded_full().bg("#58c26b")];
}

export function whiteboard(x, y, rows) {
  const shown = rows.filter(([, , , show]) => show !== false);
  return div().absolute().left(x).top(y).w(150).px(8).pt(6).pb(7).bg("#fbfbf8")
    .border_3().border_color("#a6adb8").rounded(2).flex().flex_col().text_size(9).font_bold().gap(3)
    .child(div().flex().items_center().justify_between().text_color("#536070")
      .child("TEAM STATUS")
      .child(div().size(6).rounded_full().bg("#58c26b").loop("opacity", { from: 0.35, to: 1, period: 1400 })))
    .child(div().h(1).bg("#e6e9ec"))
    .child(div().flex().flex_col().gap(4).children(shown.map(([color, label, count]) =>
      div().flex().items_center().justify_between()
        .child(div().flex().items_center().gap(6)
          .child(div().size(6).rounded(1).bg(color).flex_none())
          .child(div().text_color("#3a4350").child(label)))
        .child(div().text_color("#6b7a72").child(String(count))))))
    .child(div().h(4).rounded(1).bg("#dfe4e8"));
}

// "DAYS CLEAR" resets to a blinking 0 while someone is blocked.
export function incidentSign(x, y, h, days, now) {
  return div().absolute().left(x).top(y).w(112).h(Math.min(h, 74)).p(5).bg("#f6d44c").border_3().border_color(INK)
    .flex().flex_col().items_center().justify_between().text_color(INK)
    .child(div().text_size(9).font_bold().child("DAYS CLEAR"))
    .child(div().px(10).rounded(3).bg("#1d1d24").text_size(22).font_bold().text_color(now ? "#ff5a5a" : "#7dff9a")
      .child(String(now ? 0 : days)).when(now, (el) => el.loop("opacity", { from: 0.35, to: 1, period: 600 })))
    .child(div().text_size(7).font_bold().text_color("#5c4a1b").child("BLOCKED RESETS"));
}

// A small wall calendar gives the glass wall a lived-in office detail.
export function wallCalendar(x, y, date, night) {
  const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()];
  const paper = night ? "#d9dfdf" : "#fbf8f1";
  const ink = night ? "#39465d" : "#3b3b44";
  return div().absolute().left(x).top(y).w(70).h(66).p(4).bg("#a86f4d").border_2().border_color("#694936").rounded(2)
    .child(div().absolute().left(27).top(-5).w(16).h(8).rounded(1).bg("#d7b85f"))
    .child(div().size_full().bg(paper).border_1().border_color("#9aa2ab").flex().flex_col().items_center()
      .child(div().w_full().h(14).bg("#e05252").text_size(8).font_bold().text_color("#fffaf0").flex().items_center().justify_center().child(month))
      .child(div().text_size(25).font_bold().text_color(ink).child(String(date.getDate())))
      .child(div().flex().gap(3).children([0, 1, 2, 3].map((k) => div().size(4).rounded_full().bg(["#3d8be0", "#58a368", "#e0b43d", "#9b6bdc"][k])))));
}

// A framed head-and-shoulders of the busiest agent.
export function portrait(x, y, h, who) {
  const p = 3;
  const face = who
    ? div().absolute().left(16).top(-(A.BOX - 21) * p + 4).w(A.PERSON * p).h(A.BOX * p)
      .children(A.rects([...A.STAND.body, ...(who.remote ? A.HEADSET.stand : [])], who.pal, p))
    : div().size_full().flex().items_center().justify_center().text_size(18).text_color("#fffaf0").child("?");
  return div().absolute().left(x).top(y).w(84).flex().flex_col().items_center().gap(2)
    .child(div().w(70).h(Math.min(h - 26, 62)).p(3).bg("#c99640").border_1().border_color("#8a6420")
      .child(div().relative().size_full().overflow_hidden().bg("#3d4a6b").child(face)))
    .child(div().w(84).py(1).rounded(2).bg("#e0b43d").flex().flex_col().items_center().text_color("#3b2a1a")
      .child(div().text_size(7).font_bold().child("EMPLOYEE OF THE MONTH"))
      .child(div().max_w(80).truncate().text_size(8).child(who?.name ?? "vacant")));
}

// A call on the wall with everyone working from another machine: each tile shows how
// they're doing, and clicking one goes to their terminal.
export function videoWall(x, y, h, remotes) {
  const p = 3;
  const ring = { working: "#3d8be0", blocked: "#e05252", done: "#58c26b", idle: "#5b6270" };
  const tile = (r) => {
    const st = r.status;
    const face = div().absolute().left(-1).top(-(A.BOX - 21) * p + 4).w(A.PERSON * p).h(A.BOX * p)
      .children(A.rects([...A.STAND.body, ...A.HEADSET.stand], r.pal, p))
      .when(st === "working", (el) => el.loop("top", { from: -(A.BOX - 21) * p + 4, to: -(A.BOX - 21) * p + 2, period: 320 }));
    return div().id(`call-${r.address}`).w(48).h(48).relative().overflow_hidden().rounded(3).bg("#24425a")
      .border_2().border_color(ring[st] ?? ring.idle).cursor_pointer().tooltip(r.title)
      .on_click(() => run("pane.focus", { pane: r.pane }))
      .child(face)
      .when(st === "working", (el) => el.child(div().absolute().left(0).top(0).size_full().bg("#7fb6ff").opacity(0.12)))
      .when(st === "idle", (el) => el.child(div().absolute().left(0).top(0).size_full().bg("#0b1030").opacity(0.5))
        .child(div().absolute().right(3).top(1).text_size(8).font_bold().text_color("#c9c2ff").frames(["z", "zZ", "zZz"], 900)))
      .when(st === "blocked", (el) => el.child(div().absolute().right(2).top(1).px(3).rounded(3).bg("#e05252")
        .text_size(9).font_bold().text_color("#ffffff").child("!").loop("opacity", { from: 0.4, to: 1, period: 600 })))
      .when(st === "done", (el) => el.child(div().absolute().right(2).top(1).px(3).rounded(3).bg("#2f9a50")
        .text_size(9).font_bold().text_color("#ffffff").child("✓")))
      .child(div().absolute().left(0).bottom(0).w_full().h(10).bg("#000000aa").px(2).flex().items_center()
        .text_size(7).text_color("#ffffff").child(div().truncate().child(r.name)));
  };
  const machines = [...new Set(remotes.map((r) => r.machine))].join(", ");
  return div().absolute().left(x).top(y).p(4).bg("#1d1d24").rounded(3).border_2().border_color("#3b3b44").flex().flex_col().gap(3)
    .child(div().flex().items_center().gap(4).max_w(48 * 3 + 6).text_size(8).font_bold()
      .child(div().size(5).flex_none().rounded_full().bg("#e05252").loop("opacity", { from: 0.3, to: 1, period: 1200 }))
      .child(div().truncate().text_color("#cfd6e0").child(`REMOTE · ${machines}`)))
    .child(div().flex().flex_wrap().gap(3).max_w(48 * 3 + 6).max_h(h - 22).overflow_hidden().children(remotes.slice(0, 6).map(tile)));
}
