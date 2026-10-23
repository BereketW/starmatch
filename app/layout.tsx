import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StarMatch — Astrological Compatibility & Synastry",
  description:
    "Deterministic astronomical synastry and compatibility engine. Instant, account-free relationship analysis with Co-Star depth and Spotify Wrapped statistical clarity.",
  metadataBase: new URL("https://starmatch.app"),
  openGraph: {
    title: "StarMatch — Astrological Compatibility & Synastry",
    description: "Two charts. One sharp truth. Instant account-free synastry calculation with 0.1° ephemeris precision.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const themeInitScript = `
(function() {
  try {
    localStorage.setItem('starmatch_theme', 'alabaster');
    document.documentElement.setAttribute('data-theme', 'alabaster');
    document.documentElement.classList.remove('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="alabaster"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)] font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
