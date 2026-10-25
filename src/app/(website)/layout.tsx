import "@/styles/website/index.css";
import { WebsiteShell } from "@/components/website/WebsiteShell";

/**
 * Avoid next/font/google here — it fetches at build time and fails offline /
 * when Google Fonts is unreachable. Runtime <link> keeps the same families.
 */
export const dynamic = "force-dynamic";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700&family=Poppins:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="website-font-root">
        <WebsiteShell>{children}</WebsiteShell>
      </div>
    </>
  );
}
