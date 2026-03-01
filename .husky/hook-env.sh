#!/usr/bin/env sh

# Keep hooks portable: allow per-user shell setup via Husky's official init file.
if command -v node >/dev/null 2>&1; then
  return 0
fi

i="${XDG_CONFIG_HOME:-$HOME/.config}/husky/init.sh"
[ -f "$i" ] && . "$i"

# Common Linux/macOS nvm location.
if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
fi

# Common Windows nvm paths when running hooks via Git Bash.
if ! command -v node >/dev/null 2>&1 && [ -n "${NVM_SYMLINK:-}" ]; then
  export PATH="$(printf '%s' "$NVM_SYMLINK" | tr '\\\\' '/'):$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "husky - Node.js not found in PATH" >&2
  echo "husky - install Node or configure ~/.config/husky/init.sh" >&2
  exit 127
fi
