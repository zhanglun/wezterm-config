#!/usr/bin/env bash
set -euo pipefail

# Install the versioned office-2 layout/mod into the local Herdr config.
# Default: copy (Herdr's file watcher hot-reloads edits made here afterwards).
# --link: symlink the repo files instead. Reading works, but Herdr's watcher
# does not follow symlinked targets, so mod edits need an app restart to apply.
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
herdr_home="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"
mode="copy"
[[ "${1:-}" == "--link" ]] && mode="link"

command -v herdr-app >/dev/null 2>&1 || {
  echo "herdr-app is required; install/open Herdr first." >&2
  exit 1
}

mkdir -p "$herdr_home/layouts" "$herdr_home/mods"

mods=(office-2 spaces-tabs panel-buttons)

if [[ "$mode" == "copy" ]]; then
  cp "$repo_dir/layouts/office-2.json" "$herdr_home/layouts/office-2.json"
  cp "$repo_dir/layouts/office-2.svg" "$herdr_home/layouts/office-2.svg"
  for m in "${mods[@]}"; do
    rm -rf "$herdr_home/mods/$m"
    cp -R "$repo_dir/mods/$m" "$herdr_home/mods/$m"
  done
else
  ln -sfn "$repo_dir/layouts/office-2.json" "$herdr_home/layouts/office-2.json"
  ln -sfn "$repo_dir/layouts/office-2.svg" "$herdr_home/layouts/office-2.svg"
  for m in "${mods[@]}"; do
    # Generated type files live beside the sources (gitignored); keep them across relinks.
    mkdir -p "$repo_dir/mods/$m"
    for f in gpui-kit.d.ts herdr.d.ts jsconfig.json; do
      [[ -f "$herdr_home/mods/$m/$f" && ! -e "$repo_dir/mods/$m/$f" ]] && \
        cp "$herdr_home/mods/$m/$f" "$repo_dir/mods/$m/$f" || true
    done
    rm -rf "$herdr_home/mods/$m"
    ln -sfn "$repo_dir/mods/$m" "$herdr_home/mods/$m"
  done
fi

for m in "${mods[@]}"; do herdr-app check "$herdr_home/mods/$m"; done
herdr-app do layout.switch --name office-2 >/dev/null
printf 'Installed office-2 (%s) into %s\n' "$mode" "$herdr_home"
