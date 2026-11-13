import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { readPreferences } from "@/lib/preferences";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Nelio", template: "%s · Nelio" },
  description: "Nelio is an AI social media operating system for creators, businesses and agencies.",
  applicationName: "Nelio",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B14" },
  ],
};

// Decision D-21: Light is the default, Dark has full parity, System follows the OS, and the choice is persisted.
// "system" is resolved before first paint (and kept in step with the OS) so there is no flash of the wrong theme.
const resolveSystemTheme = `(function(){try{var d=document.documentElement;var m=matchMedia("(prefers-color-scheme: dark)");var a=function(){if(d.dataset.themePref==="system"){d.dataset.theme=m.matches?"dark":"light"}};a();m.addEventListener("change",a)}catch(e){}})()`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { theme, reduceMotion } = await readPreferences();
  return (
    <html
      lang="en"
      data-theme={theme === "system" ? "light" : theme}
      data-theme-pref={theme}
      data-motion={reduceMotion ? "reduce" : undefined}
      className={`${jakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: resolveSystemTheme }} />
        <a href="#main" className="sr-only-focusable">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
