#!/usr/bin/env bash
# Open office-2's art gallery in its own Herdr window, leaving the daily
# window's layout untouched. The preview runs from an isolated HERDR_APP_HOME
# (default ~/.config/herdr-preview), so it has its own layout choice and
# never talks to the daily window's CLI socket. Terminals/spaces still come
# from the shared herdr-core, so the live office strip shows real agents.
#
# Repeat runs refresh the copied mods (hot reload applies) and raise the
# already-open preview window.
set -euo pipefail
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
preview_home="${HERDR_PREVIEW_HOME:-$HOME/.config/herdr-preview}"
herdr_bin="$(command -v herdr-app 2>/dev/null || true)"
[[ -n "$herdr_bin" ]] || herdr_bin="$HOME/Applications/Herdr.app/Contents/MacOS/Herdr"
[[ -x "$herdr_bin" ]] || { echo "herdr-app not found; install/open Herdr first." >&2; exit 1; }
[[ -f "$repo_dir/mods/office-2/main.js" && -f "$repo_dir/mods/office-preview/main.js" ]] || {
  echo "Run this script from the repository checkout." >&2; exit 1; }

mkdir -p "$preview_home/layouts" "$preview_home/mods"

# A fresh home would open with the welcome tour and the "what's new" notes;
# mark both as done up front. The shared.json key is flat: the dot is part of
# the key name, not a nested object.
if [[ ! -f "$preview_home/shared.json" ]]; then
  printf '{"frame.welcomed":"finished"}\n' > "$preview_home/shared.json"
fi
if [[ ! -f "$preview_home/update-notes.json" ]]; then
  app_version="$("$herdr_bin" --version 2>/dev/null | grep -Eo '[0-9]+(\.[0-9]+)+')" || app_version=""
  if [[ -n "$app_version" ]]; then
    printf '{"last_run":"%s","presented":["%s"]}\n' "$app_version" "$app_version" > "$preview_home/update-notes.json"
  fi
fi

# Not named main.json on purpose: Herdr's version migration rewrites main.json
# in a home it does not recognise and archives the original.
cp "$repo_dir/layouts/preview-window.json" "$preview_home/layouts/preview-window.json"

# Mods: fresh copies every run, so editing the repo and re-running the script
# updates the preview. gpui-kit.d.ts/jsconfig.json stay out — Herdr owns those.
rm -rf "$preview_home/mods/preview-titlebar" "$preview_home/mods/office-preview" "$preview_home/mods/office-2"
cp -R "$repo_dir/mods/preview-titlebar" "$preview_home/mods/preview-titlebar"
cp -R "$repo_dir/mods/office-2" "$preview_home/mods/office-2"
rm -f "$preview_home/mods/office-2/gpui-kit.d.ts" "$preview_home/mods/office-2/jsconfig.json"
cp -R "$repo_dir/mods/office-preview" "$preview_home/mods/office-preview"
# The repo's office-preview carries no art/decor (install-office-preview.sh
# copies them from the installed office-2); copy them straight from the repo.
cp "$repo_dir/mods/office-2/art.js" "$preview_home/mods/office-preview/art.js"
cp -R "$repo_dir/mods/office-2/art" "$preview_home/mods/office-preview/art"
cp "$repo_dir/mods/office-2/decor.js" "$preview_home/mods/office-preview/decor.js"
cp -R "$repo_dir/mods/office-2/decor" "$preview_home/mods/office-preview/decor"

# Launch or raise the preview window.
env HERDR_APP_HOME="$preview_home" "$herdr_bin" >/dev/null 2>&1 &
disown

# Wait for its CLI socket, then show the gallery layout (remembered for next time).
for _ in $(seq 1 40); do
  if HERDR_APP_HOME="$preview_home" "$herdr_bin" do layout.switch --name preview-window >/dev/null 2>&1; then
    echo "Office preview window ready (home: $preview_home)"
    exit 0
  fi
  sleep 0.25
done
echo "Preview window did not answer; run this script again." >&2
exit 1
