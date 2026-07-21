import type { Metadata } from "next";
import { StoreProvider } from "@/services/redux/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vrindavan Rasa",
  description: "Vrindavan Rasa storefront and admin",
  icons: {
    icon: [
      { url: "/icon.jpeg", type: "image/jpeg" },
      { url: "/favicon.jpeg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.jpeg",
    apple: "/icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
