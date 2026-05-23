import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Merriweather, Open_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { ClientChrome } from "@/components/ClientChrome";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteFrame } from "@/components/SiteFrame";
import { content } from "@/lib/content-registry";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["300", "400", "600", "700"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["300", "400", "600", "700"],
});

/** Primary: headings, body, buttons, navigation (font_families.json) */
const fontPrimary = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  weight: ["400", "500", "600", "700", "800"],
});

/** Secondary: tech stack, code snippets, labels, tags */
const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

/** Accent: quotes, testimonials, highlight statements */
const fontAccent = Merriweather({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: content.profile.seo.title,
  description: content.profile.seo.metaDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${oswald.variable} ${fontPrimary.variable} ${fontMono.variable} ${fontAccent.variable} font-sans min-h-screen antialiased`}
      >
        <ThemeProvider>
          <SiteFrame>{children}</SiteFrame>
          <ClientChrome />
        </ThemeProvider>
      </body>
    </html>
  );
}
