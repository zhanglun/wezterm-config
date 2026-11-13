// The office: every agent is a coworker with a desk of their own. Working: typing.
// Idle: they walk to the water cooler and chat; idle long enough, they nap on the couch.
// Blocked: hand up at their desk (five minutes and the fire alarm goes). Done: cheering in
// confetti until you look. New agents come in the door; closed ones leave with a box.
// Sub-agents sit by their parent's desk as interns and graduate when they finish.
// Three finishes in five minutes and pizza arrives. A cat lives here. Lights go down after
// dark, the windows show the real weather, and the office decorates for the season.
// Hover anyone to see what they're working on; click them to go to their terminal.
import { View, div, svg } from "gpui-kit";
import { actor, renderPart } from "./sprite.js";
import { agents, terminals, spaces, panes, shared, run, setAgentOrder, fonts } from "herdr";
import * as A from "./art.js";
import * as D from "./decor.js";

// Real weather in the windows. Off by default: it sends your IP address to ipapi.co for a
// rough location, then asks Open-Meteo for the current conditions there.
const WEATHER = true;
const WALK_SPEED = 0.16; // px per ms
const CAT_SPEED = 0.12;
const NAP_AFTER = 10 * 60 * 1000;
const ALARM_AFTER = 5 * 60 * 1000;
const SWEAT_AFTER = 30 * 60 * 1000;
const MUGS_AFTER = 60 * 60 * 1000;
const PARTY_FINISHES = 3, PARTY_WINDOW = 5 * 60 * 1000, PARTY_LENGTH = 8 * 60 * 1000;
const GRAD_BOW = 2500;
const COUCH_SEATS = 3;
const MIN_DESKS = 3;
const FRONT_ROW = 6;
const DAY = 86400000;
const CHAT = ["…", "☕", "lgtm", "standup?", "🍩", "ship it", "nice", "brb", "tabs > spaces", "🎉", "coffee?", "hmm"];
const PIZZA_CHAT = ["🍕", "nom", "pizza!", "🍕", "best day", "nom nom"];
const CODE = ["#7fd1b9", "#f2b866", "#9aa8ff", "#e88fb0"];
const CONFETTI = ["#e05252", "#e0b43d", "#58b368", "#3d8be0", "#9b6bdc", "#e05c8c"];
const STATUS = { working: "#3d8be0", blocked: "#e05252", done: "#58c26b", idle: "#9aa0aa" };
const DEFAULT_SCALE = 3;
const PIXEL_FONT = "Fusion Pixel 12px Prop zh_hans";
// Keep office-3 portable: absent local font inherits Herdr's default face.
const UI_FONT = fonts().includes(PIXEL_FONT) ? PIXEL_FONT : null;
const PERSON_FRAME = A.PERSON_FRAME;
const CAT_FRAME = A.CAT_FRAME;
const DESK_FRAME = A.DESK_SPRITE.frame;
// The sidebar's space colors (mods/my-spaces), by stored name.
const MARK = { ansi6: "#22a99a", ansi3: "#e3814f", ansi4: "#5b8def", ansi5: "#8b7cf6", ansi2: "#3fae6a", ansi1: "#d9649a" };

const mins = (s) => { const [h, m] = String(s ?? "").split(":").map(Number); return Number.isFinite(h) ? h * 60 + (m || 0) : null; };
// Day/night from the weather API's is_day when we have it, hour bands otherwise.
// Golden (sunrise/sunset) = the first/last 90 minutes of real daylight.
function sky(hour, meta) {
  const now = hour * 60;
  const isDay = meta?.isDay ?? null;
  if (isDay === false || (isDay === null && (hour < 5 || hour >= 21)))
    return { top: "#141c38", bottom: "#2a3766", stars: true, hour };
  if (isDay === null && hour >= 19) return { top: "#544a86", bottom: "#e07a5f", hour };
  const sr = mins(meta?.sunrise) ?? 375, ss = mins(meta?.sunset) ?? 1065;
  if (now >= sr && now < sr + 90) return { top: "#9cc3e6", bottom: "#f4b98a", hour, golden: true };
  if (now >= ss - 90 && now < ss) return { top: "#f7c98b", bottom: "#f29a6b", hour, golden: true };
  return { top: "#7fc4f0", bottom: "#c4e6f8", hour };
}
const lightsDown = (hour, meta) => meta?.isDay === false || hour >= 20 || hour < 6;

// WMO weather codes (Open-Meteo) to what the windows show.
function weatherKind(code) {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code === 45 || code === 48) return "fog";
  if (code === 3) return "clouds";
  if (code === 2) return "partly";
  return "clear";
}

function season(d) {
  const m = d.getMonth(), day = d.getDate();
  if ((m === 11 && day === 31) || (m === 0 && day <= 2)) return "newyear";
  if (m === 11) return "winter";
  if (m === 9) return "halloween";
  if (m === 1 && day === 14) return "valentine";
  return null;
}

const rotate = (list, n) => list.map((_, i) => list[(i + n) % list.length]);
const clock = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
const remote = (address) => address.includes("/");
const mugOf = (a) => {
  const names = `${a.program?.key ?? ""} ${a.app ?? ""}`;
  return Object.entries(A.MUGS).find(([k]) => names.includes(k))?.[1] ?? A.PALETTE.mug;
};
// Live sub-agents under `addr`, however deep.
const descendants = (all, addr) =>
  all.filter((k) => k.parent === addr && k.state === "live").flatMap((k) => [k, ...descendants(all, k.address)]);

function loadNumber(key) {
  try { return Number(localStorage.getItem(key)) || null; } catch { return null; }
}
function saveNumber(key, n) {
  try { localStorage.setItem(key, String(n)); } catch {}
}

export default class Office extends View {
  init(_props, cx) {
    this.size = { width: 1400, height: 250 };
    this.desk = {}; // address -> desk index, kept while the agent lives
    this.at = {}; // walker -> { spot, x, y, fromX, until, dur, face }
    this.routes = {}; // walker -> { id, points, index }
    this.entering = {}; // new agents using the door-to-floor entry route
    this.seen = {}; // address -> what we knew last render: { status, pal }
    this.idleSince = {};
    this.blockedSince = {};
    this.finishes = []; // when agents finished, for the pizza
    this.party = null; // { start }
    this.leaving = {}; // address -> pal: closed agents on their way out
    this.kids = {}; // intern address -> { x, y, p, pal } where it sat last render
    this.grads = {}; // intern address -> { x, y, p, pal, start }
    this.away = [];
    this.hovered = null;
    this.weather = null;
    this.started = false;
    this.cat = { goal: "sit", desk: null, since: Date.now(), phase: "floor" };
    this.now = new Date();
    this.incident = loadNumber("office.incident") ?? Date.now();
    saveNumber("office.incident", this.incident);
    cx.timer.every(30000, (cx) => { this.now = new Date(); cx.notify(); });
    cx.timer.every(9000, (cx) => { if (this.wanderCat()) cx.notify(); });
    if (WEATHER) {
      this.refreshWeather(cx);
      cx.timer.every(30 * 60 * 1000, (cx) => this.refreshWeather(cx));
    }
  }

  refreshWeather(cx) {
    cx.spawn(async (cx) => {
      try {
        if (!this.where) {
          const r = await fetch("http://ip-api.com/json/?fields=status,lat,lon,timezone");
          const j = await r.json();
          if (j?.status === "success" && Number.isFinite(j.lat)) this.where = { lat: j.lat.toFixed(2), lon: j.lon.toFixed(2), tz: j.timezone };
        }
        if (!this.where) return;
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this.where.lat}&longitude=${this.where.lon}&current=weather_code,temperature_2m,wind_speed_10m,relative_humidity_2m,is_day&daily=sunrise,sunset&timezone=auto`);
        const j = await r.json();
        const current = j.current ?? {};
        this.weather = weatherKind(current.weather_code ?? 0);
        this.weatherMeta = {
          temp: Number.isFinite(current.temperature_2m) ? Math.round(current.temperature_2m) : null,
          wind: Number.isFinite(current.wind_speed_10m) ? Math.round(current.wind_speed_10m) : null,
          hum: Number.isFinite(current.relative_humidity_2m) ? Math.round(current.relative_humidity_2m) : null,
          isDay: current.is_day === 1,
          sunrise: j.daily?.sunrise?.[0]?.slice(11) ?? null,
          sunset: j.daily?.sunset?.[0]?.slice(11) ?? null,
          place: (this.where.tz || j.timezone || "").split("/").pop()?.replaceAll("_", " ") ?? "local",
        };
        cx.notify();
      } catch {}
    });
  }

  // Desks are handed out once, lowest free first, so nobody swaps seats. Agents that
  // closed head for the door with a box.
  seat(list, g, cx) {
    const { door, floorY } = g;
    const live = new Set(list.map((a) => a.address));
    for (const k of Object.keys(this.desk)) {
      if (live.has(k)) continue;
      const at = this.at[k];
      if (this.started && at && this.seen[k]) {
        const pos = this.position(at);
        const id = `${k}:${Date.now()}`;
        const points = [];
        // Only add a vertical leg when the agent is in the back row. Avoid a
        // zero-distance waypoint, which made a leaver stand and walk in place.
        if (Math.abs(pos.y - floorY) > 1) points.push({ spot: `leave-floor:${k}`, x: pos.x, y: floorY, depth: "back" });
        points.push(
          { spot: `leave-door:${k}`, x: door.x, y: floorY, depth: "front" },
          { spot: "door", x: door.x, y: door.y, depth: "front" },
        );
        this.leaving[k] = { pal: this.seen[k].pal, id, points };
        this.routeWalk(`leave:${k}`, id, points, WALK_SPEED, cx, { ...at, ...pos });
      }
      delete this.desk[k]; delete this.at[k]; delete this.routes[k]; delete this.entering[k];
      delete this.idleSince[k]; delete this.blockedSince[k]; delete this.seen[k];
    }
    const taken = new Set(Object.values(this.desk));
    for (const a of list) {
      if (a.address in this.desk) continue;
      let i = 0;
      while (taken.has(i)) i++;
      this.desk[a.address] = i;
      taken.add(i);
    }
  }

  // Since-when for idle and blocked, finishes for the pizza, and the incident sign.
  track(list, now, cx) {
    const changed = {};
    for (const s of spaces()) for (const t of s.tabs ?? []) changed[t.id] = t.changed_at;
    for (const a of list) {
      const was = this.seen[a.address]?.status;
      if (a.status !== "idle") delete this.idleSince[a.address];
      else this.idleSince[a.address] ??= changed[a.tab] ?? now;
      if (a.status !== "blocked") delete this.blockedSince[a.address];
      else this.blockedSince[a.address] ??= was === "blocked" || !was ? (changed[a.tab] ?? now) : now;
      if (this.started && a.status === "done" && was && was !== "done") this.finishes.push(now);
      this.seen[a.address] = { status: a.status, pal: A.look(a.address) };
    }
    this.finishes = this.finishes.filter((t) => now - t < PARTY_WINDOW);
    if (!this.party && this.finishes.length >= PARTY_FINISHES) {
      this.party = { start: now };
      this.finishes = [];
      cx.timer.after(PARTY_LENGTH + 50, (cx) => { this.party = null; cx.notify(); });
    }
    if (list.some((a) => a.status === "blocked") && now - this.incident > 60000) {
      this.incident = now;
      saveNumber("office.incident", now);
    }
  }

  // Current interpolated position. New elements (notably leavers) do not get a
  // previous DOM frame for GPUI's transition to animate from.
  position(at, now = Date.now()) {
    if (!at?.until || now >= at.until) return { x: at.x, y: at.y };
    const linear = Math.max(0, Math.min(1, 1 - (at.until - now) / at.dur));
    const t = linear * linear * (3 - 2 * linear);
    const fromY = at.fromY ?? at.y;
    return { x: at.fromX + (at.x - at.fromX) * t, y: fromY + (at.y - fromY) * t };
  }

  wakeWalk(key, until, cx) {
    if (this.at[key]?.until !== until) return;
    if (Date.now() < until) cx.timer.after(30, (cx) => this.wakeWalk(key, until, cx));
    cx.notify();
  }

  // Starts a walk when a walker's spot changes; returns where it is (or is heading).
  // `start`: where a new walker appears (the door), instead of at its spot.
  walk(key, spot, x, y, speed, cx, start) {
    const now = Date.now();
    const fresh = !this.at[key] && Boolean(start);
    const at = this.at[key] ?? (start ? { ...start, spot: null } : null);
    if (!at) return (this.at[key] = { spot, x, y, fromX: x, fromY: y, until: 0, dur: 1 });
    if (fresh) {
      const dur = Math.max(400, Math.hypot(x - at.x, y - at.y) / speed);
      this.at[key] = { ...at, spot, fromX: at.x, fromY: at.y, until: now + dur, dur };
      this.doorUntil = Math.max(this.doorUntil ?? 0, now + dur);
      cx.timer.after(30, (cx) => this.wakeWalk(key, this.at[key].until, cx));
      return this.at[key];
    }
    if (at.spot === spot && at.x === x && at.y === y) return at;
    const from = this.position(at, now);
    const dur = Math.max(400, Math.hypot(x - from.x, y - from.y) / speed);
    this.at[key] = { spot, x, y, fromX: from.x, fromY: from.y, until: now + dur, dur, face: at.face };
    if (spot === "door") this.doorUntil = Math.max(this.doorUntil ?? 0, now + dur);
    cx.timer.after(30, (cx) => this.wakeWalk(key, this.at[key].until, cx));
    return this.at[key];
  }

  // Follow simple orthogonal waypoints instead of cutting diagonally through furniture.
  routeWalk(key, id, points, speed, cx, start) {
    let route = this.routes[key];
    if (!route || route.id !== id) route = this.routes[key] = { id, points, index: 0 };
    else route.points = points;
    let at;
    while (route.index < points.length) {
      const point = points[route.index];
      at = this.walk(key, point.spot, point.x, point.y, speed, cx, route.index === 0 ? start : null);
      at.depth = point.depth;
      if (Date.now() < at.until) break;
      if (route.index === points.length - 1) break;
      route.index++;
    }
    return { at, done: route.index === points.length - 1 && Date.now() >= at.until };
  }

  personRoute(a, target, g, start = this.at[a.address]) {
    const id = `${target.spot}:${target.x}:${target.y}`;
    const current = this.routes[a.address];
    if (current?.id === id) return { id, points: current.points };
    const floor = g.floorY;
    const depth = target.y < floor ? "back" : "front";
    if (!start || (start.spot === target.spot && start.x === target.x && start.y === target.y)) {
      return { id, points: [{ ...target, depth }] };
    }
    const fromBack = start.depth === "back" || (!start.depth && start.spot !== "door" && start.y < floor);
    const targetBack = depth === "back";
    const points = [];
    const add = (spot, x, y, pointDepth) => {
      const last = points.at(-1);
      if (!last || last.x !== x || last.y !== y) points.push({ spot, x, y, depth: pointDepth });
    };
    const fromLaneY = fromBack ? g.backLaneY : g.frontLaneY;
    const targetLaneY = targetBack ? g.backLaneY : g.frontLaneY;
    const kitchenTarget = target.spot === "cooler" || target.spot === "couch" || target.spot === "pizza";
    const crossesCounter = target.spot === "cooler" || target.spot === "couch";
    const counterCrossing = !fromBack && !targetBack
      && ((start.x < g.counterLeft && target.x > g.counterRight) || (start.x > g.counterRight && target.x < g.counterLeft));
    if (fromBack !== targetBack) {
      add("source-lane", start.x, fromLaneY, fromBack ? "back" : "front");
      add("kitchen-gate", g.kitchenGateX, fromLaneY, fromBack ? "back" : "front");
      add("target-lane", g.kitchenGateX, crossesCounter ? g.kitchenLaneY : targetLaneY, crossesCounter ? "back" : (targetBack ? "back" : "front"));
    } else {
      add("source-lane", start.x, fromLaneY, fromBack ? "back" : "front");
    }
    if (counterCrossing) {
      // Cross the counter only on the rear lane; return to the front beyond its edge.
      const leftToRight = start.x < target.x;
      const leftGate = g.kitchenGateX;
      const rightGate = g.counterRight + 6 * g.P;
      const nearGate = leftToRight ? leftGate : rightGate;
      const farGate = leftToRight ? rightGate : leftGate;
      add("counter-entry", nearGate, g.frontLaneY, "front");
      add("counter-rear-entry", nearGate, g.kitchenLaneY, "back");
      add("counter-rear-exit", farGate, g.kitchenLaneY, "back");
      add("counter-exit", farGate, g.frontLaneY, "front");
      add("target-lane", target.x, targetLaneY, "front");
    } else if (kitchenTarget) {
      if (crossesCounter) {
        // Use the nearest safe side; left-side cooler targets must not backtrack past the target.
        const exitX = target.x < g.coolerLeft ? target.x : g.counterRight + 6 * g.P;
        add("kitchen-gate", g.kitchenGateX, g.kitchenLaneY, "back");
        add("counter-clearance", exitX, g.kitchenLaneY, "back");
        add("counter-exit", exitX, g.frontLaneY, "front");
      } else {
        add("kitchen-gate", g.kitchenGateX, g.frontLaneY, "front");
      }
      add("furniture-clearance", target.x, g.frontLaneY, "front");
      add("target-lane", target.x, targetLaneY, targetBack ? "back" : "front");
    } else {
      add("target-lane", target.x, targetLaneY, targetBack ? "back" : "front");
    }
    const last = points.at(-1);
    if (last?.x === target.x && last?.y === target.y) {
      points.push({ ...target, depth });
    } else {
      add(target.spot, target.x, target.y, depth);
    }
    return { id, points };
  }

  geometry(W, H, deskCount) {
    const P = Math.max(3, Math.min(6, Math.floor(H / 60)));
    const floorY = H - 30;
    const wallBottom = floorY - 14 * P;
    const slot = DESK_FRAME.width * P;
    const front = Math.min(deskCount, FRONT_ROW);
    const back = Math.max(0, deskCount - FRONT_ROW);
    const desksW = Math.max(front, back ? back + 0.5 : 0) * slot;
    const gap = 18 * P;
    const doorW = 16 * P;
    const kitchen = A.COUNTER_SPRITE.frame.width * P + gap + A.COOLER_SPRITE.frame.width * P + 22 * P + A.COUCH_SPRITE.frame.width * P + 6 * P + A.PLANT_SPRITE.frame.width * P;
    const room = doorW + 20 + A.PLANT_SPRITE.frame.width * P + 10 + desksW + 50 + kitchen;
    // Door pinned toward the left edge so it sits in a solid wall pier, not on the glass.
    const doorX = Math.max(8, Math.min(Math.round((W - room) / 2), 48));
    const plantL = doorX + doorW + 20;
    const x0 = plantL + A.PLANT_SPRITE.frame.width * P + 10;
    const zoneX = x0 + desksW + 50;
    const coolerX = zoneX + A.COUNTER_SPRITE.frame.width * P + gap;
    const couchX = coolerX + A.COOLER_SPRITE.frame.width * P + 22 * P;
    const deskPos = (i) => i < FRONT_ROW
      ? { x: x0 + i * slot, y: floorY, back: false }
      : { x: x0 + (i - FRONT_ROW) * slot + slot / 2, y: floorY - 10 * P, back: true };
    // The back lane runs below the raised back desks; the front lane is the actual floor line.
    const backLaneY = floorY - 6 * P;
    const frontLaneY = floorY;
    // Reuse the back lane so the crossing stays below the wall UI and behind the counter.
    const kitchenLaneY = backLaneY;
    const counterLeft = zoneX;
    const counterRight = zoneX + A.COUNTER_SPRITE.frame.width * P;
    // Leave the whole person frame outside the counter before changing depth.
    const kitchenGateX = counterLeft - (PERSON_FRAME.width + 2) * P;
    const coolerRight = coolerX + A.COOLER_SPRITE.frame.width * P;
    const couchRight = couchX + A.COUCH_SPRITE.frame.width * P;
    return {
      P, floorY, wallBottom, backLaneY, frontLaneY, kitchenLaneY, kitchenGateX,
      counterLeft, counterRight, coolerLeft: coolerX, coolerRight,
      couchLeft: couchX, couchRight, slot, x0, deskPos, zoneX, coolerX, couchX, doorX, plantL,
      plantR: couchX + A.COUCH_SPRITE.frame.width * P + 6 * P,
      door: { x: doorX + 2 * P, y: wallBottom + 2 * P },
    };
  }

  // Picks the cat's next stop: a nap on an empty keyboard, or a sit somewhere on the floor.
  wanderCat() {
    const g = this.g;
    if (!g) return false;
    const c = this.cat;
    if (c.goal === "sleep" && this.away.includes(c.desk) && Date.now() - c.since < 60000) return false;
    if (this.away.length && Math.random() < 0.45) {
      this.cat = { goal: "sleep", desk: this.away[Math.floor(Math.random() * this.away.length)], since: Date.now(), phase: "edge" };
    } else {
      const span = g.couchX + A.COUCH_SPRITE.frame.width * g.P - g.x0;
      this.cat = { goal: "sit", desk: null, x: Math.round(g.x0 + Math.random() * span), since: Date.now(), phase: "floor" };
      delete this.at.cat;
    }
    return true;
  }

  render(cx) {
    const { width: W, height: H } = this.size;
    const list = agents();
    // Agents on other machines are working from home: they're on the video call, not in a chair.
    const here = list.filter((a) => !remote(a.address));
    const all = terminals();
    const now = Date.now();
    setAgentOrder(list.map((a) => a.address));

    const deskCount = Math.max(MIN_DESKS, here.length, ...Object.values(this.desk).map((i) => i + 1));
    const g = (this.g = this.geometry(W, H, deskCount));
    this.seat(here, g, cx);
    this.track(list, now, cx);
    const P = g.P;
    const byDesk = {};
    for (const a of here) byDesk[this.desk[a.address]] = a;
    const tabs = {};
    for (const s of spaces()) for (const t of s.tabs ?? []) tabs[t.id] = t;
    const branches = {};
    for (const p of panes()) branches[p.pane] = p.branch;

    // The pizza: the courier walks in, leaves it on the counter, and walks out.
    const party = this.party;
    const counter = { x: g.zoneX + 2 * P, y: g.floorY };
    const courierTrip = party ? Math.max(400,
      (Math.abs(g.floorY - g.door.y) + Math.abs(counter.x - g.door.x)) / WALK_SPEED) : 0;
    const pizzaHere = party && now >= party.start + courierTrip;

    // Where everyone goes. Long idlers take the couch while there's room; the rest
    // gather around the cooler (or the pizza), alternating sides, further out each pair.
    const idle = here.filter((a) => a.status === "idle").sort((a, b) => this.idleSince[a.address] - this.idleSince[b.address]);
    const nappers = pizzaHere ? [] : idle.filter((a) => now - this.idleSince[a.address] > NAP_AFTER).slice(0, COUCH_SEATS);
    const chatters = idle.filter((a) => !nappers.includes(a));
    const place = {};
    nappers.forEach((a, k) => { place[a.address] = { spot: "couch", x: g.couchX + (k * 10 - 1) * P, y: g.floorY, face: 1 }; });
    const hub = pizzaHere ? { left: g.zoneX - 12 * P, right: g.zoneX + A.COUNTER_SPRITE.frame.width * P - 4 * P }
      : { left: g.coolerX - (PERSON_FRAME.width - 3) * P, right: g.coolerRight + 3 * P };
    chatters.forEach((a, k) => {
      const left = k % 2 === 0;
      // Keep same-side actors wider than the 16px person frame so they do not stack.
      const ring = Math.floor(k / 2) * 18 * P;
      place[a.address] = { spot: pizzaHere ? "pizza" : "cooler", x: left ? hub.left - ring : hub.right + ring, y: g.floorY, face: left ? 1 : -1 };
    });
    for (const a of here) {
      const d = g.deskPos(this.desk[a.address]);
      place[a.address] ??= { spot: "desk", x: d.x, y: d.y, face: 1 };
    }
    this.away = here.filter((a) => place[a.address].spot !== "desk").map((a) => this.desk[a.address]);
    if (this.cat.goal === "sleep" && !this.away.includes(this.cat.desk)) this.wanderCat();

    const alarmed = here.filter((a) => a.status === "blocked" && now - (this.blockedSince[a.address] ?? now) > ALARM_AFTER);
    const people = here.map((a) => {
      const p = place[a.address];
      const d = g.deskPos(this.desk[a.address]);
      if (this.started && !this.at[a.address] && !this.entering[a.address]) {
        this.entering[a.address] = { id: a.address, points: [] };
      }
      let at, moving;
      if (this.entering[a.address]) {
        const entry = this.entering[a.address];
        entry.id = `${a.address}:entry:${p.spot}:${p.x}:${p.y}`;
        const entryRoute = this.personRoute(a, p, g, { ...g.door, spot: "door", depth: "front" });
        entry.points = entryRoute.points;
        const result = this.routeWalk(a.address, entry.id, entry.points, WALK_SPEED, cx, g.door);
        at = result.at;
        moving = !result.done;
        if (result.done) {
          delete this.entering[a.address];
          delete this.routes[a.address];
        }
      } else {
        const route = this.personRoute(a, p, g);
        const result = this.routeWalk(a.address, route.id, route.points, WALK_SPEED, cx);
        at = result.at;
        moving = !result.done;
      }
      return { depth: at.depth ?? (p.y < g.floorY ? "back" : "front"), walking: moving, el: this.person(a, at, g, p.face, tabs[a.tab], alarmed.includes(a), moving, p.spot) };
    });
    // Back-row walkers stay behind the furniture; front-row walkers belong in
    // front of it, like the seated agents they are walking toward.
    const walkingBackPeople = people.filter((p) => p.walking && p.depth === "back").map((p) => p.el);
    const walkingFrontPeople = people.filter((p) => p.walking && p.depth === "front").map((p) => p.el);
    const backPeople = people.filter((p) => !p.walking && p.depth === "back").map((p) => p.el);
    const frontPeople = people.filter((p) => !p.walking && p.depth === "front").map((p) => p.el);
    const desks = Array.from({ length: deskCount }, (_, i) => {
      const pos = g.deskPos(i);
      const a = byDesk[i];
      return { back: pos.back, el: this.deskAt(i, pos, g, a, a && tabs[a.tab], a && branches[a.pane]) };
    });
    const graduatePeople = this.graduates(g, now, cx);
    const graduateBackWalking = graduatePeople.filter((p) => p.walking && p.depth === "back").map((p) => p.el);
    const graduateBackPeople = graduatePeople.filter((p) => !p.walking && p.depth === "back").map((p) => p.el);
    const graduateFrontWalking = graduatePeople.filter((p) => p.walking && p.depth !== "back").map((p) => p.el);
    const graduateFrontPeople = graduatePeople.filter((p) => !p.walking && p.depth !== "back").map((p) => p.el);
    const leavingPeople = this.leavers(g, now, cx);
    const leavingBackWalking = leavingPeople.filter((p) => p.walking && p.depth === "back").map((p) => p.el);
    const leavingBackPeople = leavingPeople.filter((p) => !p.walking && p.depth === "back").map((p) => p.el);
    const leavingFrontWalking = leavingPeople.filter((p) => p.walking && p.depth !== "back").map((p) => p.el);
    const leavingFrontPeople = leavingPeople.filter((p) => !p.walking && p.depth !== "back").map((p) => p.el);
    const kittyEl = this.kitty(g, cx);
    const kittyOnDesk = this.cat.goal === "sleep" && this.cat.phase === "sleep";
    const kittyBack = kittyOnDesk && g.deskPos(this.cat.desk).back;

    const hour = this.now.getHours();
    const dark = lightsDown(hour, this.weatherMeta);
    const when = season(this.now);
    const hovered = here.find((a) => a.address === this.hovered);
    this.started = true;

    return div().id("office").size_full().relative().overflow_hidden().bg("#efe3cf")
      .when(UI_FONT, (el) => el.font_family(UI_FONT))
      .on_size_change((size, cx) => { this.size = size; cx.notify(); })
      .children([
        ...this.room(W, H, g, sky(hour, this.weatherMeta), list, all, now, when),
        // Back-row walkers stay behind the desk; front-row walkers stay in front of both desk and sitter.
        ...walkingBackPeople,
        ...graduateBackWalking,
        ...leavingBackWalking,
        ...desks.filter((d) => d.back).map((d) => d.el),
        ...backPeople,
        ...graduateBackPeople,
        ...leavingBackPeople,
        ...(kittyBack ? [kittyEl] : []),
        ...desks.filter((d) => !d.back).map((d) => d.el),
        this.prop(A.COUNTER_SPRITE, g.zoneX, g),
        ...D.coffeeSteam(g.zoneX + 9 * P, g.floorY - 20 * P),
        ...(pizzaHere ? [this.prop(A.PIZZA_BOX_SPRITE, g.zoneX, g)] : []),
        this.prop(A.COOLER_SPRITE, g.coolerX, g),
        this.prop(A.COUCH_SPRITE, g.couchX, g),
        ...frontPeople,
        ...graduateFrontPeople,
        ...leavingFrontPeople,
        ...(kittyOnDesk && !kittyBack ? [kittyEl] : []),
        ...walkingFrontPeople,
        ...graduateFrontWalking,
        ...leavingFrontWalking,
        ...D.lifeProps(g, lightsDown(this.now.getHours(), this.weatherMeta), Math.floor(this.now.getTime() / 60000) % 3 === 0),
        ...D.petCorner(g, lightsDown(this.now.getHours(), this.weatherMeta)),
        this.prop(A.PLANT_SPRITE, g.plantR, g),
        ...(when === "winter" ? [this.prop(A.TREE_SPRITE, g.plantL - 3 * P, g)] : [this.prop(A.PLANT_SPRITE, g.plantL, g)]),
        ...(when === "halloween" ? [this.prop(A.PUMPKIN_SPRITE, g.plantL + 10 * P, g), this.prop(A.PUMPKIN_SPRITE, g.plantR - 9 * P, g),
          ...(pizzaHere ? [] : [this.prop(A.PUMPKIN_SPRITE, g.zoneX + 13 * P, g, 11 * P)])] : []),
        ...here.flatMap((a) => this.interns(a, descendants(all, a.address), g)),
        ...(party ? [this.courier(party, counter, courierTrip, g, now, cx).el] : []),
        ...(!kittyOnDesk ? [kittyEl] : []),
        ...(dark ? this.night(W, H, g, byDesk, deskCount, when) : []),
        ...(alarmed.length ? D.alarm(W, H, g.deskPos(this.desk[alarmed[0].address]).x + 27 * P) : []),
        ...(hovered && this.at[hovered.address] ? [this.thought(hovered, this.at[hovered.address], g)] : []),
        ...(list.length ? [] : [this.sign(W, g)]),
      ]);
  }

  room(W, H, g, s, list, all, now, when) {
    const { P, wallBottom, zoneX } = g;
    const weather = this.weather ?? (when === "winter" ? "snow" : null);
    const windowWeather = { drizzle: "rain", partly: "clouds" }[weather] ?? weather;
    // Solid pier on the left carries the door; glass fills the rest of the wall.
    const pierW = g.plantL - 8;
    const els = [
      div().absolute().left(0).top(0).w(pierW).h(wallBottom).bg("#e9dcbd")
        .child(div().absolute().left(0).top(0).w(pierW).h(3).bg("#f6ecd8"))
        .child(div().absolute().left(pierW - 2).top(0).w(2).h(wallBottom).bg("#cdb995")),
      D.glassWall(pierW, W - pierW, wallBottom, s, windowWeather),
      div().absolute().left(0).top(wallBottom - 4).w(W).h(4).bg("#7a5c3e"),
      div().absolute().left(0).top(wallBottom).w(W).h(H - wallBottom).bg("#b9895a"),
      D.floorRunner(Math.max(24, g.doorX - 18), H - 25, Math.min(W - 48, zoneX - g.doorX + 210)),
      ...D.ceilingLights([Math.max(90, g.doorX + 110), Math.round(W * 0.5), Math.min(W - 90, zoneX + 160)]),
      ...D.roomDetails(W, H, g, lightsDown(this.now.getHours(), this.weatherMeta), this.weather),
    ];
    for (let y = wallBottom + 12; y < H; y += 14) els.push(div().absolute().left(0).top(y).w(W).h(1).bg("#a5784d"));
    for (let i = 0, y = wallBottom; y < H; i++, y += 14)
      for (let x = (i % 2) * 60 + 20; x < W; x += 120) els.push(div().absolute().left(x).top(y).w(1).h(13).bg("#a5784d"));

    const remotes = list.filter((a) => remote(a.address)).map((a) => ({
      address: a.address, pane: a.pane, pal: A.look(a.address), machine: a.address.split("/")[0],
      name: a.space_name, status: a.status, title: a.title || a.tab_name || a.space_name,
    }));
    const blockedNow = list.some((a) => a.status === "blocked");
    const wbW = 150;
    const wbX = Math.min(zoneX, W - wbW - 16);
    const wx = Math.max(60, wbX - 162);
    const signH = Math.min(74, Math.max(48, wallBottom - 22));
    els.push(D.incidentSign(g.plantL + 12, 10, signH, Math.floor((now - this.incident) / DAY), blockedNow));
    els.push(D.wallCalendar(Math.round((g.x0 + zoneX) / 2) - 35, 14, this.now, lightsDown(this.now.getHours(), this.weatherMeta)));
    if (remotes.length) {
      const vidX = Math.max(g.x0 + 10, wx - 176);
      const vidY = vidX < Math.round((g.x0 + zoneX) / 2) + 50 ? Math.max(8, Math.min(98, wallBottom - 88)) : 8;
      els.push(D.videoWall(vidX, vidY, Math.min(signH + 4, wallBottom - vidY - 4), remotes));
    }
    els.push(D.door(g.doorX, wallBottom, P, now < (this.doorUntil ?? 0)));
    els.push(D.weatherBoard(wx, 14, clock(this.now), this.weather, this.weatherMeta, lightsDown(this.now.getHours(), this.weatherMeta)));
    const count = (st) => list.filter((a) => a.status === st).length;
    const napping = list.filter((a) => this.at[a.address]?.spot === "couch").length;
    const interns = list.reduce((n, a) => n + descendants(all, a.address).length, 0);
    els.push(D.whiteboard(wbX, 14, [
      ["#3d8be0", "WORK", count("working")],
      ["#58a368", "DONE", count("done")],
      ["#e05252", "BLOCK", count("blocked")],
      ["#8a8f99", "BREAK", count("idle") - napping],
      ["#6b5fb5", "NAP", napping, napping > 0],
      ["#c0643f", "INT", interns, interns > 0],
      ["#d94a3a", "PIZZA", "!", Boolean(this.party)],
    ]));
    if (when === "winter" || when === "newyear") els.push(...D.stringLights(W, 2));
    if (when === "newyear") els.push(D.banner(W, wallBottom - 9 * P - 30, "HAPPY NEW YEAR", "#9b6bdc"));
    if (when === "valentine") els.push(D.banner(W, wallBottom - 9 * P - 30, "♥  HAPPY VALENTINE'S  ♥", "#e05c8c"));
    return els;
  }

  sign(W, g) {
    return div().absolute().left(W / 2 - 140).top(g.wallBottom - 34).w(280).py(4).bg("#26313dcc")
      .border_1().border_color("#657585").text_size(10).text_color("#eef5f0").flex().justify_center()
      .child("NO AGENTS · START ONE TO OPEN THE OFFICE");
  }

  renderSprite(sprite, palette, scale) {
    return renderPart(sprite.rects, sprite.frame, palette, scale);
  }

  prop(sprite, x, g, lift = 0) {
    return actor(sprite.frame, x, g.floorY - lift, [this.renderSprite(sprite, A.PALETTE, g.P)], g.P);
  }

  // A desk with its chair, monitor, bell and lamp, the branch on a sticky note, and the
  // nameplate of whoever sits there.
  deskAt(i, pos, g, a, tab, branch) {
    const P = g.P;
    const st = a?.status;
    const away = Boolean(a) && this.at[a.address]?.spot !== "desk";
    const pal = a ? { ...A.PALETTE, mug: mugOf(a) } : A.PALETTE;
    const done = st === "done" && !away;
    const overtime = st === "working" && tab?.working_since && Date.now() - tab.working_since > MUGS_AFTER;
    const plate = a ? this.plate(a) : null;
    return actor(DESK_FRAME, pos.x, pos.y, [
        this.renderSprite(A.CHAIR_SPRITE, pal, P),
        this.renderSprite(A.DESK_SPRITE, pal, P),

        ...(overtime ? [this.renderSprite(A.MUG_PILE_SPRITE, pal, P)] : []),
        ...D.deskAccent(st, P, away, overtime),
        this.screen(away ? "idle" : st, away, P),
        ...(branch ? [this.sticky(branch, P)] : []),
        this.renderSprite(A.BELL_SPRITE, pal, P)
          .when(done, (el) => el.loop("left", { from: -1.5, to: 1.5, period: 160 })),
        ...(done ? [this.ding(P), ...this.confetti(P, a.address)] : []),
        ...(plate ? [plate.absolute().left(6 * P).top(pos.back ? (PERSON_FRAME.height - 29) * P : PERSON_FRAME.height * P + 6)] : []),
      ], P).id(`desk-${i}`)
      .when(Boolean(a), (el) => el.cursor_pointer().on_click(() => run("pane.focus", { pane: a.pane })));
  }

  screen(st, screensaver, P) {
    const [sx, sy, sw, sh] = A.DESK_SPRITE.screen;
    const bg = { blocked: "#4a1a1e", done: "#143a24", working: "#13263f" }[st] ?? "#0b1220";
    return div().absolute().left(sx * P).top(sy * P).w(sw * P).h(sh * P).bg(bg).overflow_hidden()
      .when(st === "working", (el) => el.children(CODE.map((c, k) =>
        div().absolute().left(P * (k % 2 === 0 ? 1 : 2)).top(P * (1 + 2 * k) - 1).h(P - 1).bg(c)
          .loop("width", { from: P, to: P * (8 - (k % 2)), period: 700 + k * 260, easing: "linear" }))))
      .when(st === "blocked", (el) => el.flex().items_center().justify_center().text_size(14).font_bold().text_color("#ff6b6b")
        .child("!").loop("opacity", { from: 0.4, to: 1, period: 700 }))
      .when(st === "done", (el) => el.flex().items_center().justify_center().text_size(13).font_bold().text_color("#6be38b").child("✓"))
      .when(screensaver, (el) => el.child(div().absolute().top(P * 3).h(P).w(P).bg("#3d8be0")
        .loop("left", { from: P, to: P * 8, period: 5000 })));
  }

  sticky(branch, P) {
    return div().absolute().left(18 * P).top((PERSON_FRAME.height - 26) * P).w(10 * P).h(5 * P).px(2).bg("#f6e27a")
      .border_1().border_color("#b99b32").flex().items_center().overflow_hidden()
      .text_size(9).font_bold().text_color("#4a3a10").child(div().truncate().child(branch));
  }

  ding(P) {
    return div().absolute().left(15 * P).top((PERSON_FRAME.height - 21) * P).text_size(11).font_bold().text_color("#b8860b")
      .child("ding!").loop("opacity", { from: 0, to: 1, period: 640 });
  }

  // Paper falling over the desk, for as long as the news is unread.
  confetti(P, seed) {
    let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return Array.from({ length: 16 }, (_, k) => {
      const r = ((h >>> (k % 24)) ^ Math.imul(k + 1, 2654435761)) >>> 0;
      const x = (4 + (r % 34)) * P;
      return div().absolute().left(x).w(P).h(k % 3 === 0 ? P * 2 : P).bg(CONFETTI[k % CONFETTI.length])
        .loop("top", { from: (PERSON_FRAME.height - 30) * P - (k % 5) * 8, to: (PERSON_FRAME.height - 1) * P, period: 1100 + ((r >>> 3) % 900), easing: "linear" })
        .loop("left", { from: x - 4, to: x + 4, period: 500 + ((r >>> 5) % 400) });
    });
  }

  spaceTile(id) {
    const icon = (shared("space.icons") ?? {})[id];
    const c = (shared("space.colors") ?? {})[id] ?? "ansi6";
    const fill = c.startsWith("#") ? c : MARK[c] ?? "#22a99a";
    return div().size(12).flex_none().rounded(3).bg(fill).flex().items_center().justify_center().text_size(9).text_color("#ffffff")
      .when(Boolean(icon?.svg), (el) => el.child(svg(icon.svg).size(8)))
      .when(Boolean(icon?.text), (el) => el.child(icon.text));
  }

  plate(a) {
    const focused = a.focused;
    const remoteText = remote(a.address) ? "REMOTE" : null;
    return div().max_w((DESK_FRAME.width - 8) * (this.g?.P ?? DEFAULT_SCALE)).h(16).px(5).gap(4).rounded(4).flex().items_center()
      .bg(focused ? "#fff6dd" : "#27313bcc").text_size(11).font_bold().text_color(focused ? "#3b2a1a" : "#fffaf0")
      .child(div().size(6).flex_none().rounded_full().bg(STATUS[a.status] ?? STATUS.idle))
      .child(this.spaceTile(a.space))
      .when(Boolean(remoteText), (el) => el.child(div().flex_none().text_size(8).text_color(focused ? "#8a6a2d" : "#c9d7e5").child(remoteText)))
      .child(div().truncate().child(a.space_name + (a.tab_name ? ` · ${a.tab_name}` : "")));
  }

  // Sub-agents: small people on stools in front of their parent's desk, laptops out.
  interns(a, kids, g) {
    if (!kids.length) return [];
    const P = g.P;
    const p = Math.max(2, Math.round(P * 0.7));
    const pos = g.deskPos(this.desk[a.address]);
    const x0 = pos.x + 20 * P;
    const shown = kids.slice(0, 3);
    const els = shown.map((k, i) => {
      const pal = A.look(k.address);
      const x = x0 + i * 8 * P;
      this.kids[k.address] = { x, y: pos.y, p, pal };
      const busy = k.status === "working";
      const stuck = k.status === "blocked" || k.status === "error";
      return actor(PERSON_FRAME, x, pos.y, [
        this.part(A.SIT.stool, pal, -1, p), this.part(A.SIT.body, pal, -1, p),
        ...(busy ? [this.part(A.SIT.laptop, pal, -1, p), this.part(A.SIT.lapArm, pal, -1, p).loop("top", { from: 0, to: -1.5, period: 260 + i * 40 })]
          : [this.part(A.SIT.rest, pal, -1, p)]),
        ...(stuck ? [this.bubble((PERSON_FRAME.height - 24) * p - 18, "#e05252", p).child("!").loop("opacity", { from: 0.5, to: 1, period: 700 })] : []),
      ], p).id(`intern-${k.address}`)
        .cursor_pointer().on_click(() => run("terminal.peek", { terminal: k.address }));
    });
    if (kids.length > shown.length)
      els.push(div().absolute().left(x0 + 3 * 8 * P).top(pos.y - 14 * P).px(4).rounded(4).bg("#00000055")
        .text_size(11).text_color("#fffaf0").child(`+${kids.length - shown.length}`));
    return els;
  }

  // Interns that finished: a bow where they sat, then out the door.
  graduates(g, now, cx) {
    const live = new Set(terminals().filter((t) => t.state === "live").map((t) => t.address));
    for (const [k, info] of Object.entries(this.kids)) {
      if (live.has(k)) continue;
      delete this.kids[k];
      if (!this.started) continue;
      this.grads[k] = { ...info, start: now };
      cx.timer.after(GRAD_BOW + 20, (cx) => cx.notify());
    }
    return Object.entries(this.grads).flatMap(([k, gr]) => {
      const box = (el, x, y) => actor(PERSON_FRAME, x, y, [el], gr.p).id(`grad-${k}`);
      if (now < gr.start + GRAD_BOW) {
        const body = this.pose(gr.pal, -1, [A.STAND.backLeg, A.STAND.frontLeg, A.STAND.arm], gr.p)
          .child(this.part(A.STAND.body, gr.pal, -1, gr.p).left(-gr.p).loop("top", { from: 0, to: 2 * gr.p, period: 900 }));
        return [{ walking: false, depth: gr.y < g.floorY ? "back" : "front", el: box(body, gr.x, gr.y).child(this.bubble((PERSON_FRAME.height - 20) * gr.p - 18, "#3b3b44", gr.p).child("🎓 thx!")) }];
      }
      const id = `grad:${k}`;
      const route = this.routes[id] ?? {
        id,
        points: [
          ...(gr.y < g.floorY ? [{ spot: "grad-floor", x: gr.x, y: g.floorY, depth: "back" }] : []),
          { spot: "grad-door-floor", x: g.door.x, y: g.floorY, depth: "front" },
          { spot: "door", x: g.door.x, y: g.door.y, depth: "front" },
        ],
      };
      const result = this.routeWalk(id, route.id, route.points, WALK_SPEED, cx, { x: gr.x, y: gr.y });
      const at = result.at;
      if (result.done) { delete this.grads[k]; delete this.at[id]; delete this.routes[id]; return []; }
      return [{ walking: !result.done, depth: at.depth ?? "front", el: box(this.walker(gr.pal, -1, [], gr.p), at.x, at.y) }];
    });
  }

  // Closed agents carrying their box out.
  leavers(g, now, cx) {
    return Object.entries(this.leaving).flatMap(([k, leave]) => {
      const result = this.routeWalk(`leave:${k}`, leave.id, leave.points, WALK_SPEED, cx);
      const at = result.at;
      if (!at || result.done) {
        delete this.leaving[k]; delete this.at[`leave:${k}`]; delete this.routes[`leave:${k}`];
        return [];
      }
      const pos = this.position(at, now);
      return [{
        walking: true,
        depth: at.depth,
        el: actor(PERSON_FRAME, pos.x, pos.y, [this.walker(leave.pal, Math.sign(at.x - at.fromX) || -1, [A.STAND.box], g.P, false)], g.P)
          .id(`leave-${k}`),
      }];
    });
  }

  courier(party, counter, trip, g, now, cx) {
    const stay = 2500;
    const leaving = now >= party.start + trip + stay;
    if (now >= party.start + 2 * trip + stay + 100) return { depth: "front", el: div() };
    if (!leaving) cx.timer.after(party.start + trip + stay - now + 20, (cx) => cx.notify());
    const floorDoor = { spot: "door-floor", x: g.door.x, y: g.floorY, depth: "front" };
    const floorCounter = { spot: "counter", x: counter.x, y: g.floorY, depth: "front" };
    const route = leaving ? [floorCounter, floorDoor, { spot: "door", x: g.door.x, y: g.door.y, depth: "front" }]
      : [floorDoor, floorCounter];
    const result = this.routeWalk("courier", leaving ? "out" : "in", route, WALK_SPEED, cx, g.door);
    const at = result.at;
    const walking = now < at.until;
    const face = walking ? Math.sign(at.x - at.fromX) || 1 : 1;
    const body = walking ? this.walker(A.COURIER, face, leaving ? [] : [A.STAND.pizza], g.P, leaving)
      : this.pose(A.COURIER, 1, [A.STAND.backLeg, A.STAND.frontLeg, A.STAND.body, A.STAND.armUp]);
    const pos = this.position(at, now);
    return { depth: at.depth ?? "front", el: actor(PERSON_FRAME, pos.x, pos.y, [body], g.P).id("courier")
      .when(!walking, (el) => el.child(this.bubble((PERSON_FRAME.height - 20) * g.P - 20, "#d94a3a").child("pizza! 🍕"))) };
  }

  person(a, at, g, placeFace, tab, alarmed, moving = false, destinationSpot = at.spot) {
    const P = g.P;
    const spot = moving ? at.spot : destinationSpot;
    const napping = spot === "couch";
    const base = A.look(a.address);
    const pal = napping ? { ...base, eye: "#00000000" } : base;
    const away = remote(a.address);
    const now = Date.now();
    const walking = moving;
    const pos = this.position(at, now);
    const face = walking ? Math.sign(at.x - at.fromX) || 1 : placeFace;
    at.face = face;
    const st = a.status;
    const hs = away ? [A.HEADSET.stand] : [];
    let body, headTop;
    if (walking) [body, headTop] = [this.walker(pal, face, hs), 22];
    else if (spot === "cooler" || spot === "pizza") {
      body = this.pose(pal, face, [A.STAND.backLeg, A.STAND.frontLeg, A.STAND.body, ...hs, A.STAND.cup])
        .loop("top", { from: 0, to: -1, period: 2600 + (pal.salt % 900) });
      headTop = 22;
    } else if (napping) {
      body = this.pose(pal, 1, [A.SIT.body, ...(away ? [A.HEADSET.sit] : []), A.SIT.rest])
        .loop("top", { from: 0, to: 1.5, period: 3400 + (pal.salt % 700) });
      headTop = 24;
    } else if (st === "working") {
      const sweaty = tab?.working_since && Date.now() - tab.working_since > SWEAT_AFTER;
      body = div().absolute().size_full().children([
        this.part(A.SIT.body, pal, 1),
        ...(away ? [this.part(A.HEADSET.sit, pal, 1)] : []),
        this.part(A.SIT.arm, pal, 1).loop("top", { from: 0, to: -2, period: 240 + (pal.salt % 120) }),
        ...(sweaty ? [0, 1].map((k) => div().absolute().left((k ? 1 : 9) * P).w(P).h(P * 1.5).rounded(P).bg("#7fc4f0")
          .loop("top", { from: (PERSON_FRAME.height - 23 + k) * P, to: (PERSON_FRAME.height - 18 + k) * P, period: 900 + k * 300, easing: "ease-in" })) : []),
      ]);
      headTop = 24;
    } else if (alarmed) {
      body = this.pose(pal, 1, [A.STAND.backLeg, A.STAND.frontLeg, A.STAND.body, ...hs])
        .child(this.part(A.STAND.armUp, pal, 1).loop("top", { from: 0, to: -P, period: 260 }))
        .child(this.part(A.STAND.armUpBack, pal, 1).loop("top", { from: -P, to: 0, period: 260 }))
        .loop("top", { from: 0, to: -4, period: 420 });
      headTop = 23;
    } else {
      // blocked: one hand up, bouncing; done: both hands up, hopping
      const cheer = st === "done";
      body = this.pose(pal, 1, [A.STAND.backLeg, A.STAND.frontLeg, A.STAND.body, ...hs, A.STAND.armUp, cheer ? A.STAND.armUpBack : A.STAND.arm])
        .loop("top", { from: 0, to: cheer ? -6 : -3, period: cheer ? 560 : 900 });
      headTop = 23;
    }

    const top = (PERSON_FRAME.height - headTop) * P - 20;
    let bubble = null;
    if (walking) bubble = null;
    else if (spot === "pizza") bubble = this.bubble(top, "#d94a3a").frames(rotate(PIZZA_CHAT, pal.salt % PIZZA_CHAT.length), 1800 + (pal.salt % 900));
    else if (spot === "cooler") bubble = this.bubble(top, "#3b3b44").frames(rotate(CHAT, pal.salt % CHAT.length), 2200 + (pal.salt % 1500));
    else if (napping) bubble = this.bubble(top, "#6b5fb5").frames(["z", "zZ", "zZz", "zZ"], 900);
    else if (alarmed) bubble = this.bubble(top, "#e05252").child("HELP!!").loop("opacity", { from: 0.5, to: 1, period: 400 });
    else if (st === "blocked") bubble = this.bubble(top, "#e05252").child("!").loop("opacity", { from: 0.5, to: 1, period: 700 });
    else if (st === "done") bubble = this.bubble(top, "#2f9a50").child("✓");
    at.headTop = headTop;

    return actor(PERSON_FRAME, pos.x, pos.y, [body, ...(bubble ? [bubble] : [])], P).id(`person-${a.address}`)
      .cursor_pointer().on_click(() => run("pane.focus", { pane: a.pane }))
      .on_hover((h, cx) => {
        if (h) this.hovered = a.address;
        else if (this.hovered === a.address) this.hovered = null;
        cx.notify();
      });
  }

  // What they're working on, in a thought cloud over their head.
  thought(a, at, g) {
    const P = g.P;
    const text = (a.title || a.tab_name || a.program?.name || "thinking…").replace(/\s+/g, " ").trim();
    const x = at.x + 8 * P;
    const y = at.y - PERSON_FRAME.height * P + (PERSON_FRAME.height - (at.headTop ?? 22)) * P;
    return div().absolute().left(Math.max(4, x - 20)).top(Math.max(2, y - 54))
      .child(div().max_w(260).px(8).py(4).rounded(10).bg("#ffffff").border_1().border_color("#3b3b44")
        .text_size(11).text_color("#3b3b44").child(div().truncate().child(`💭 ${text}`)))
      .child(div().absolute().left(16).top(26).size(7).rounded_full().bg("#ffffff").border_1().border_color("#3b3b44"))
      .child(div().absolute().left(22).top(35).size(4).rounded_full().bg("#ffffff").border_1().border_color("#3b3b44"));
  }

  part(list, pal, face, p = this.g?.P ?? DEFAULT_SCALE) {
    return renderPart(list, PERSON_FRAME, pal, p, face);
  }

  pose(pal, face, parts, p = this.g?.P ?? DEFAULT_SCALE) {
    return div().absolute().size_full().children(parts.map((l) => this.part(l, pal, face, p)));
  }

  // Walking: the standing legs slide in opposite phases under a gentle body
  // bob, and one front arm swings slightly — the same walk the original
  // office mod (demo) uses. `extra` parts ride along (a headset, a box);
  // carrying hides the arm, and `swing` false keeps it still.
  walker(pal, face, extra = [], p = this.g?.P ?? DEFAULT_SCALE, swing = true) {
    const carryBox = extra.includes(A.STAND.box);
    const carryPizza = extra.includes(A.STAND.pizza);
    return div().absolute().size_full().loop("top", { from: 0, to: -2, period: 320 }).children([
      this.part(A.STAND.backLeg, pal, face, p).loop("left", { from: -p, to: p, period: 520, easing: "linear" }),
      this.part(A.STAND.body, pal, face, p),
      ...extra.map((l) => this.part(l, pal, face, p)),
      this.part(A.STAND.frontLeg, pal, face, p).loop("left", { from: p, to: -p, period: 520, easing: "linear" }),
      ...(carryBox || carryPizza ? [] : [this.part(A.STAND.arm, pal, face, p).when(swing, (el) => el.loop("left", { from: -2, to: 2, period: 520 }))]),
    ]);
  }

  catJumpWake(until, cx) {
    if (this.cat.phase !== "jump" || this.cat.jumpUntil !== until) return;
    if (Date.now() < until) cx.timer.after(30, (cx) => this.catJumpWake(until, cx));
    cx.notify();
  }

  kitty(g, cx) {
    const P = g.P;
    const c = this.cat;
    const now = Date.now();
    const onDesk = c.goal === "sleep" && c.phase === "sleep";
    const target = c.goal === "sleep" ? g.deskPos(c.desk) : null;
    const deskX = target ? target.x + 8 * P : 0;
    const deskY = target ? target.y - 12 * P : 0;
    let x, y, at = null, walking = false, jumping = false;

    if (c.goal === "sleep" && c.phase === "edge") {
      // Walk to the front edge first; the jump is a separate animation.
      const edge = this.walk("cat", `cat-edge-${c.desk}-${c.since}`, deskX, g.floorY, CAT_SPEED, cx);
      at = edge;
      walking = now < edge.until;
      if (!walking) {
        c.phase = "jump";
        c.jumpStart = now;
        c.jumpUntil = now + 480;
        delete this.at.cat;
        cx.timer.after(30, (cx) => this.catJumpWake(c.jumpUntil, cx));
      }
    }

    if (c.goal === "sleep" && c.phase === "jump") {
      jumping = true;
      const t = Math.max(0, Math.min(1, 1 - (c.jumpUntil - now) / 480));
      const baseY = g.floorY + (deskY - g.floorY) * t;
      x = deskX;
      y = baseY - Math.sin(Math.PI * t) * 8 * P;
      if (now >= c.jumpUntil) {
        c.phase = "sleep";
        delete c.jumpStart;
        delete c.jumpUntil;
        x = deskX;
        y = deskY;
        jumping = false;
      }
    } else if (c.goal === "sleep" && c.phase === "sleep") {
      x = deskX;
      y = deskY;
    } else if (c.goal !== "sleep") {
      const floorX = c.x ?? g.couchX - 12 * P;
      at = this.walk("cat", `cat-floor-${c.since}`, floorX, g.floorY, CAT_SPEED, cx);
      walking = now < at.until;
      x = this.position(at, now).x;
      y = g.floorY;
    }

    if (walking) {
      const pos = this.position(at, now);
      x = pos.x;
      y = pos.y;
    }
    const face = jumping ? 1 : (walking ? Math.sign(at.x - at.fromX) || 1 : (at?.face ?? 1));
    const part = (list) => renderPart(list, CAT_FRAME, A.PALETTE, P, face);
    let body;
    if (walking || jumping) body = div().absolute().size_full().children([
      part(A.KITTY.legsA).loop("left", { from: -1, to: 1.5, period: 360, easing: "linear" }),
      part(A.KITTY.legsB).loop("left", { from: 1.5, to: -1, period: 360, easing: "linear" }),
      part(A.KITTY.body).loop("top", { from: 0, to: -1, period: 360 }),
    ]);
    else if (onDesk) body = div().absolute().size_full().children([
      part(A.KITTY.sleep).loop("top", { from: 0, to: 0.8, period: 2400 }),
      div().absolute().left(9 * P).top((CAT_FRAME.height - 10) * P).text_size(10).font_bold().text_color("#6b5fb5").frames(["z", "zz", "zzz", ""], 800),
    ]);
    else body = part(A.KITTY.sit);
    return actor(CAT_FRAME, x, y, [body], P).id("cat");
  }

  // After dark: the room dims, lamps light the occupied desks, and busy screens glow.
  night(W, H, g, byDesk, deskCount, when) {
    const P = g.P;
    const [bx, by, bw, bh] = A.DESK_SPRITE.bulb;
    const [sx, sy] = A.DESK_SPRITE.screen;
    const els = [
      ...(this.weather === "storm" ? [div().absolute().left(0).top(0).w(W).h(H).bg("#d8edff")
        .loop("opacity", { from: 0, to: 0.08, period: 5200, easing: "ease-in" })] : []),
      // Keep the room cozy, not pitch-black: a light wash only, then warm pools under
      // the ceiling lamps and big halos on every occupied desk.
      div().absolute().left(0).top(0).w(W).h(H).bg("#0b1030").opacity(0.32),
      ...[Math.max(90, g.doorX + 110), Math.round(W * 0.5), Math.min(W - 90, g.zoneX + 160)].map((lx) =>
        div().absolute().left(lx - 75).top(8).w(150).h(95).rounded_full().bg("#ffe6a3").opacity(0.08)),
    ];
    if (when === "winter" || when === "newyear") els.push(...D.stringLights(W, 2));
    for (let i = 0; i < deskCount; i++) {
      const a = byDesk[i];
      if (!a || this.at[a.address]?.spot !== "desk") continue;
      const pos = g.deskPos(i);
      const top = pos.y - PERSON_FRAME.height * P;
      els.push(div().absolute().left(pos.x + (bx - 7) * P).top(top + by * P - 2 * P).w(24 * P).h(8 * P).bg("#ffd27a").opacity(0.06));
      els.push(div().absolute().left(pos.x + (bx - 4) * P).top(top + by * P - P).w(14 * P).h(5 * P).bg("#ffd27a").opacity(0.14));
      els.push(div().absolute().left(pos.x + bx * P).top(top + by * P).w(bw * P).h(bh * P).bg("#fff2b0"));
      if (a.status !== "idle") {
        els.push(div().absolute().left(pos.x + (sx - 5) * P).top(top + (sy - 5) * P).w(20 * P).h(17 * P).rounded(7 * P)
          .bg({ working: "#7fb6ff", blocked: "#ff6b6b", done: "#6be38b" }[a.status]).opacity(0.18));
        els.push(div().absolute().left(pos.x).top(top).w(DESK_FRAME.width * P).h(DESK_FRAME.height * P).child(this.screen(a.status, false, P)));
      }
    }
    return els;
  }

  bubble(top, color, p = DEFAULT_SCALE) {
    return div().absolute().left((PERSON_FRAME.width * p) / 2 - 4).top(top).px(5).h(16).flex().items_center().rounded(5)
      .bg("#fffdf7").border_1().border_color(color).text_size(11).font_bold().text_color(color).whitespace_nowrap();
  }
}
