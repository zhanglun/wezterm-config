# Guidelines for AI agents working in this repository

Personal config repo (WezTerm + Herdr). Conventional-commit style with Chinese
summaries, e.g. `feat(herdr): 简述`. Push to `origin/master` only when asked.

## Herdr: the person's live desktop — handle with care

The person runs Herdr as their daily terminal/agent window. Several past AI
sessions broke it the same way; do not be another one.

- **Never switch the daily window's layout.** `herdr-app do layout.switch`
  against the default home (`~/.config/herdr-app`) replaces the whole window:
  a layout without terminal blocks makes everything vanish (terminals keep
  running, but the person sees nothing). If you switched it, restore
  immediately: `herdr-app do layout.switch --name office-2`.
- **Preview office-2 art/UI only through the isolated window:**
  `./herdr/preview-window.sh` (idempotent: refreshes mods, hot-reloads,
  raises the window; isolated home `~/.config/herdr-preview`). It never
  touches the daily window.
- `herdr/install-office-preview.sh` only installs files; it must not switch
  layouts. Keep it that way.
- **Target the right window with the CLI:** `HERDR_APP_HOME=<home> herdr-app
  status|shot|check|do ...`. Default home = daily window;
  `~/.config/herdr-preview` = preview window.
- `herdr-app` may not be on PATH; the binary is
  `~/Applications/Herdr.app/Contents/MacOS/Herdr`.
- To tell Herdr instances apart, use `ps -E -p <pid> | grep HERDR_APP_HOME`.
  Do not trust `lsof <socket>` for this (it mismatched and caused a daily
  window to be killed once). Do not kill instances you did not start.
- For visual verification use `HERDR_APP_HOME=<home> herdr-app shot
  /tmp/x.png` — it captures the app frame itself, no screen-recording
  permission needed.

Background and workflows: `herdr/README.md` (preview-window loop),
`herdr/mods/office-2/STRUCTURE.md` (art/decor structure and verify steps).
