import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortalPage } from "@/components/PortalPage";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resonance AI",
  description: "AI-powered music recommendations with real iTunes previews."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PortalPage />
        <div className="hidden">{children}</div>
      </body>
    </html>
  );
}
