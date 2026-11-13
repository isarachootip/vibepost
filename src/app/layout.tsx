import type { Metadata } from "next";
import { fontVariablesClassName } from "./fonts";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIBE POST — AI Social Omni-Studio",
  description: "Tactile AI Social Media Content Studio & Auto-Publishing Platform",
};

const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var m=t==="light"?"light":"dark";var r=document.documentElement;r.dataset.theme=m;r.classList.toggle("dark",m==="dark");r.style.colorScheme=m;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      data-theme="dark"
      className={`${fontVariablesClassName} dark antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen flex bg-[var(--sheet)] text-foreground selection:bg-violet-500/30 overflow-x-hidden relative font-sans transition-colors duration-200">
        <ThemeProvider>
          <div className="flex-1 flex flex-col min-h-screen w-full mx-auto relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
