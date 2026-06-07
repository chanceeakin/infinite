import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hotel Discovery",
  description: "Find and explore hotels around the world",
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-retro-bg">
        <ThemeProvider>
          <header className="border-b-4 border-retro-primary bg-retro-surface shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
              <div>
                <Link
                  href="/"
                  className="font-serif text-2xl font-bold tracking-wide text-retro-text transition-colors hover:text-retro-primary"
                >
                  Hotel Discover
                </Link>
                <p className="text-xs uppercase tracking-widest text-retro-text-faint">
                  Find Your Perfect Stay
                </p>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
