# Herdr office-2

This directory contains the maintained `office-2` Herdr layout and mod. It is separate from the WezTerm Lua configuration and can be installed on another machine without replacing unrelated Herdr settings.

## What it is

`office-2` is a native Herdr/GPUI mod:

- JavaScript describes `div()` elements and pixel rectangles.
- Herdr renders those elements with GPUI/Rust; there is no HTML, CSS, browser view, Canvas, or third-party tile engine.
- `main.js` owns the live office view, agent states, time/weather polling, layout, and animation composition.
- `art.js` owns pixel-art data for people, desks, furniture, and the cat.
- `decor.js` owns windows, weather, glass wall, lighting, status board, calendar, and small props.
- Weather uses one IP geolocation request and Open-Meteo current/daily data. Failures are silent.
- `icons/` contains the CC0 weather PNGs and their license notice.

## Install on another computer

Requirements:

1. Install/open Herdr so `herdr-app` is available.
2. Install this repository.
3. Run:

```sh
./herdr/install-office-2.sh
```

The script copies only:

- `herdr/layouts/office-2.json`
- `herdr/layouts/office-2.svg`
- `herdr/mods/office-2/`

It does not replace `settings.json`, `keys.json`, spaces, tabs, or the existing `office` layout.

`HERDR_APP_HOME` can be set when Herdr uses a non-default config root:

```sh
HERDR_APP_HOME="$HOME/.config/herdr-app" ./herdr/install-office-2.sh
```

The script runs `herdr-app check` and switches to `office-2` after installation.

### Developing on this machine

Default copy mode keeps Herdr's hot reload working: edit the files under `herdr/mods/office-2/`, re-run the script, and the running window picks the change up within a second. One command:

```sh
./herdr/install-office-2.sh && herdr-app shot /tmp/office.png
```

### Symlink mode (opt-in)

`./herdr/install-office-2.sh --link` points Herdr at this repo with symlinks instead of copying. Reading and rendering work, but Herdr's file watcher does not follow symlinked targets, so mod/layout edits are not hot-reloaded and need an app restart to apply. Use it only when you prefer the repo as the single source and accept restarting Herdr after edits.

## Update later

On the other machine:

```sh
git pull
./herdr/install-office-2.sh
```

If the target machine has a different Herdr version, run the check first. The mod's generated `gpui-kit.d.ts` and `jsconfig.json` are intentionally not copied: Herdr owns those files and rewrites them for the local runtime.

## Keep `office` and `office-2` separate

The original `office` layout is not modified. `office-2` is the maintained version and is selected explicitly by the installer or:

```sh
herdr-app do layout.switch --name office-2
```
