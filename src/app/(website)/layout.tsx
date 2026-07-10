import "@/styles/website/index.css";
import { Playfair_Display } from "next/font/google";
import { WebsiteShell } from "@/components/website/WebsiteShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={playfair.variable}>
      <WebsiteShell>{children}</WebsiteShell>
    </div>
  );
}
