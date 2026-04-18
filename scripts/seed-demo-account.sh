#!/usr/bin/env bash
# Seed the currently authenticated user's cloud profile with QA-friendly state:
#   - 50_000 coins
#   - 25_000 totalXp
#   - every achievement marked unlocked + unclaimed (so RECLAMAR is testable)
#   - a few non-default owned items (so the equip flow is testable)
#
# Usage:
#   API_URL=http://localhost:5000 \
#   AUTH_TOKEN=<paste-token-from-the-app-AsyncStorage-key-ocho_auth_v1> \
#   scripts/seed-demo-account.sh
#
# How to grab AUTH_TOKEN from a running app:
#   - In the running Expo client, open the React Native debugger console and run:
#       AsyncStorage.getItem('ocho_auth_v1').then(console.log)
#     Copy the `token` field out of the JSON.
#   - Or call POST /api/auth/login (see server/auth.ts) and use the returned token.
#
# IMPORTANT: After this script reports success you must fully relaunch the app
# (kill + reopen, or hit `r` in the Expo dev server) so ProfileProvider refetches
# the cloud profile blob. Until then the in-memory profile keeps the old values
# and the seeded coins / unlocked achievements will not appear on screen.

set -euo pipefail

API_URL="${API_URL:-http://localhost:5000}"

if [[ -z "${AUTH_TOKEN:-}" ]]; then
  echo "ERROR: AUTH_TOKEN env var is required." >&2
  echo "       Get it from the app's AsyncStorage key 'ocho_auth_v1'," >&2
  echo "       or by calling POST /api/auth/login." >&2
  exit 1
fi

curl -fsS -X POST "${API_URL}/api/auth/dev-seed" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  | tee /dev/stderr
echo
