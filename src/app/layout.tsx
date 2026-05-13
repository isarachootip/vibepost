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
      <body className="min-h-full flex text-slate-50 bg-[#030014] selection:bg-fuchsia-500/30 overflow-hidden relative font-serif">
        {/* Vibrant Mesh Gradient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[100px]"></div>
          <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/15 blur-[120px]"></div>
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)]" style={{ backgroundSize: '32px 32px' }}></div>
        </div>
        
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative z-10 w-full max-w-[1600px] mx-auto bg-white/[0.01]">
          {children}
        </div>
      </body>
    </html>
  );
}
