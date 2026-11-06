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

if [[ "$mode" == "copy" ]]; then
  cp "$repo_dir/layouts/office-2.json" "$herdr_home/layouts/office-2.json"
  cp "$repo_dir/layouts/office-2.svg" "$herdr_home/layouts/office-2.svg"
  rm -rf "$herdr_home/mods/office-2"
  cp -R "$repo_dir/mods/office-2" "$herdr_home/mods/office-2"
else
  ln -sfn "$repo_dir/layouts/office-2.json" "$herdr_home/layouts/office-2.json"
  ln -sfn "$repo_dir/layouts/office-2.svg" "$herdr_home/layouts/office-2.svg"
  # Generated type files live beside the sources (gitignored); keep them across relinks.
  mkdir -p "$repo_dir/mods/office-2"
  for f in gpui-kit.d.ts herdr.d.ts jsconfig.json; do
    [[ -f "$herdr_home/mods/office-2/$f" && ! -e "$repo_dir/mods/office-2/$f" ]] && \
      cp "$herdr_home/mods/office-2/$f" "$repo_dir/mods/office-2/$f" || true
  done
  rm -rf "$herdr_home/mods/office-2"
  ln -sfn "$repo_dir/mods/office-2" "$herdr_home/mods/office-2"
fi

herdr-app check "$herdr_home/mods/office-2"
herdr-app do layout.switch --name office-2 >/dev/null
printf 'Installed office-2 (%s) into %s\n' "$mode" "$herdr_home"
