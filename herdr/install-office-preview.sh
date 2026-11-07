#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
herdr_home="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"
command -v herdr-app >/dev/null 2>&1 || { echo "herdr-app is required; install/open Herdr first." >&2; exit 1; }
[[ -d "$herdr_home/mods/office-2" ]] || { echo "Install office-2 first: ./herdr/install-office-2.sh" >&2; exit 1; }
mkdir -p "$herdr_home/layouts" "$herdr_home/mods"
cp "$repo_dir/layouts/office-preview.json" "$herdr_home/layouts/office-preview.json"
rm -rf "$herdr_home/mods/office-preview"
cp -R "$repo_dir/mods/office-preview" "$herdr_home/mods/office-preview"
cp -R "$herdr_home/mods/office-2/art.js" "$herdr_home/mods/office-preview/art.js"
cp -R "$herdr_home/mods/office-2/art" "$herdr_home/mods/office-preview/art"
cp -R "$herdr_home/mods/office-2/decor.js" "$herdr_home/mods/office-preview/decor.js"
cp -R "$herdr_home/mods/office-2/decor" "$herdr_home/mods/office-preview/decor"
herdr-app check "$herdr_home/mods/office-preview"
herdr-app do layout.switch --name office-preview >/dev/null
printf 'Installed native office preview into %s\n' "$herdr_home"
