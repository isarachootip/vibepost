import {
  Hanken_Grotesk,
  JetBrains_Mono,
  Noto_Sans_SC,
  Noto_Sans_Thai,
} from "next/font/google";

/**
 * Primary geometric Latin display & UI font (matches Neramit AI typography).
 */
export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

/**
 * Primary Thai body & display font with 400–800 weight spectrum.
 */
export const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
  display: "swap",
});

/**
 * Simplified Chinese support for multi-language landing & studio previews.
 */
export const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sc",
  display: "swap",
  preload: false,
});

/**
 * Monospace font for token counters, IDs, code snippets, and timestamps.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariablesClassName = [
  hankenGrotesk.variable,
  notoSansThai.variable,
  notoSansSC.variable,
  jetbrainsMono.variable,
].join(" ");
