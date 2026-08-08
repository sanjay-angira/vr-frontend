import tls from "node:tls";

/**
 * Node 22.15+ / 23+ system-CA helpers. Present at runtime on this project's
 * Node version, but missing from `@types/node` ^20.
 */
type TlsWithSystemCa = typeof tls & {
  getCACertificates?: (type?: "default" | "system" | "bundled" | "extra") => string[];
  setDefaultCACertificates?: (certs: ReadonlyArray<string | Buffer>) => void;
};

let applied = false;

/**
 * Use the OS trust store for outbound HTTPS.
 * Needed on some Windows setups where Node's bundled CAs cannot verify
 * api.vrindavanrasa.com. Prefer this over `node --use-system-ca`, which
 * breaks Next.js worker NODE_OPTIONS.
 */
export function applySystemCaCertificates(): void {
  if (applied || typeof window !== "undefined") return;

  const nodeTls = tls as TlsWithSystemCa;
  const { getCACertificates, setDefaultCACertificates } = nodeTls;

  if (
    typeof getCACertificates !== "function" ||
    typeof setDefaultCACertificates !== "function"
  ) {
    return;
  }

  try {
    setDefaultCACertificates(getCACertificates("system"));
    applied = true;
  } catch {
    // Keep Node defaults if the system store is unavailable.
  }
}
