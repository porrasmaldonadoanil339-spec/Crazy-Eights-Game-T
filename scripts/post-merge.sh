#!/bin/bash
set -e

# Post-merge setup for the Ocho Locos project.
# - Installs JS dependencies if package.json or lockfile changed.
# - Runs npm install with --no-audit --no-fund for speed and stdin-safety.

if [ -f package.json ]; then
  npm install --no-audit --no-fund --loglevel=error
fi
