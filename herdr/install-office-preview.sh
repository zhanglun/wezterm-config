#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
herdr_home="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"
herdr_bin="$(command -v herdr-app 2>/dev/null || true)"
[[ -n "$herdr_bin" ]] || herdr_bin="$HOME/Applications/Herdr.app/Contents/MacOS/Herdr"
[[ -x "$herdr_bin" ]] || { echo "herdr-app not found; install/open Herdr first." >&2; exit 1; }
[[ -d "$herdr_home/mods/office-2" ]] || { echo "Install office-2 first: ./herdr/install-office-2.sh" >&2; exit 1; }
mkdir -p "$herdr_home/layouts" "$herdr_home/mods"
cp "$repo_dir/layouts/office-preview.json" "$herdr_home/layouts/office-preview.json"
rm -rf "$herdr_home/mods/office-preview"
cp -R "$repo_dir/mods/office-preview" "$herdr_home/mods/office-preview"
cp -R "$repo_dir/mods/office-2/art.js" "$herdr_home/mods/office-preview/art.js"
cp -R "$repo_dir/mods/office-2/art" "$herdr_home/mods/office-preview/art"
cp -R "$repo_dir/mods/office-2/decor.js" "$herdr_home/mods/office-preview/decor.js"
cp -R "$repo_dir/mods/office-2/decor" "$herdr_home/mods/office-preview/decor"
"$herdr_bin" check "$herdr_home/mods/office-preview"
printf 'Installed native office preview into %s\n' "$herdr_home"
printf 'The daily layout is left untouched. Options:\n'
printf '  isolated preview window (recommended): ./herdr/preview-window.sh\n'
printf '  inside the daily window:  herdr-app do layout.switch --name office-preview\n'
printf '  back to the daily layout: herdr-app do layout.switch --name office-2\n'
