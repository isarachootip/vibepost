import type { Metadata } from "next";
import { PT_Serif } from "next/font/google";
import "./globals.css";

const serifFont = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "VIBE POST",
  description: "Social Media Management Node",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} antialiased`}
    >
      <body className="min-h-screen flex text-slate-900 bg-white selection:bg-red-500/30 overflow-x-hidden relative font-sans">
        <div className="flex-1 flex flex-col min-h-screen w-full mx-auto relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
