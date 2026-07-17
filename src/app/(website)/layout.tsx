import "@/styles/website/index.css";
import { Inter, Manrope, Poppins } from "next/font/google";
import { WebsiteShell } from "@/components/website/WebsiteShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${poppins.variable} ${manrope.variable}`}>
      <WebsiteShell>{children}</WebsiteShell>
    </div>
  );
}
