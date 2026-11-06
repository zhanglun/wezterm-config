#!/usr/bin/env bash
set -euo pipefail

# Install the versioned office-2 layout/mod without replacing the rest of Herdr.
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
herdr_home="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"

command -v herdr-app >/dev/null 2>&1 || {
  echo "herdr-app is required; install/open Herdr first." >&2
  exit 1
}

mkdir -p "$herdr_home/layouts" "$herdr_home/mods/office-2/icons"
cp "$repo_dir/layouts/office-2.json" "$herdr_home/layouts/office-2.json"
cp "$repo_dir/layouts/office-2.svg" "$herdr_home/layouts/office-2.svg"
cp "$repo_dir/mods/office-2/"*.js "$repo_dir/mods/office-2/mod.json" "$herdr_home/mods/office-2/"
cp "$repo_dir/mods/office-2/INTERIOR.md" "$herdr_home/mods/office-2/INTERIOR.md"
cp "$repo_dir/mods/office-2/icons/"*.png "$repo_dir/mods/office-2/icons/LICENSE-CC0.txt" "$herdr_home/mods/office-2/icons/"

herdr-app check "$herdr_home/mods/office-2"
herdr-app do layout.switch --name office-2 >/dev/null
printf 'Installed office-2 into %s\n' "$herdr_home"
