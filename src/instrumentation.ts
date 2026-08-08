export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { applySystemCaCertificates } = await import("./lib/nodeTls");
  applySystemCaCertificates();
}
