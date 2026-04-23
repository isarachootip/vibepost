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
      className={`${serifFont.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex text-slate-50 bg-[#060a14] selection:bg-amber-500/30 overflow-hidden relative font-serif">
        {/* Ambient gold/navy glows */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-5%] left-[5%] w-[55%] h-[55%] rounded-full bg-amber-500/15 blur-[140px]"></div>
          <div className="absolute bottom-[0%] right-[-5%] w-[70%] h-[70%] rounded-full bg-yellow-500/10 blur-[150px]"></div>
          <div className="absolute top-[25%] left-[25%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px]"></div>
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)]" style={{ backgroundSize: '32px 32px' }}></div>
        </div>
        
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative z-10 w-full max-w-[1600px] mx-auto shadow-2xl bg-white/[0.02]">
          {children}
        </div>
      </body>
    </html>
  );
}
