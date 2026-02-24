export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Codespace sends spurious SIGTERM during compilation.
    // Ignore it so the dev server stays alive.
    // Ctrl+C (SIGINT) still works for manual shutdown.
    process.on("SIGTERM", () => {
      console.warn("[dev] Ignored SIGTERM — Codespace quirk");
    });
  }
}
