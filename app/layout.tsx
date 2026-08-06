import type { Metadata, Viewport } from "next";
import { Poppins as FontSans } from "next/font/google";

import { Providers } from "@/app/providers";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

/** Only the weights actually used on screen. */
const fontSans = FontSans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Omi's Weather",
    template: "%s · Omi's Weather",
  },
  description:
    "Current conditions, air quality and a 5-day forecast for any city, with an interactive temperature, precipitation and wind chart.",
  applicationName: "Omi's Weather",
  authors: [{ name: "Om Patel", url: "https://github.com/omunite215" }],
  keywords: ["weather", "forecast", "air quality", "next.js"],
  openGraph: {
    title: "Omi's Weather",
    description:
      "Current conditions, air quality and a 5-day forecast for any city.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `suppressHydrationWarning` is required by next-themes, which writes the
    // theme class onto <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
