#!/usr/bin/env bash
# Wrapper script to keep Next.js dev server alive in GitHub Codespaces.
# Codespaces sends SIGTERM to the process group, killing the server.
# This script launches Next.js with SIGTERM ignored at the OS level,
# so only Ctrl+C (SIGINT) can stop it.

STOP=false
trap 'STOP=true; kill $CHILD 2>/dev/null' SIGINT
trap '' SIGTERM SIGHUP

while true; do
  echo "[dev.sh] Starting Next.js dev server..."

  # Launch in a subshell with SIGTERM ignored BEFORE exec.
  # POSIX: ignored signals remain ignored across exec().
  # This makes the Next.js process itself immune to SIGTERM.
  (trap '' SIGTERM SIGHUP; exec node node_modules/.bin/next dev --webpack) &
  CHILD=$!
  wait $CHILD 2>/dev/null

  if $STOP; then
    echo "[dev.sh] Ctrl+C received. Goodbye."
    break
  fi

  echo "[dev.sh] Server died. Restarting in 2 seconds... (Ctrl+C to stop)"
  sleep 2
done
