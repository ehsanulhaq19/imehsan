import type { Metadata } from "next";
import { Open_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { ClientChrome } from "@/components/ClientChrome";
import { SiteFrame } from "@/components/SiteFrame";

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

export const metadata: Metadata = {
  title: "Ehsan Ul Haq — AI & full-stack engineer",
  description:
    "Full-stack engineer building Next.js, Node, and NestJS systems with AI integration—projects, case studies, certifications, and consulting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${oswald.variable} font-sans min-h-screen antialiased`}>
        <SiteFrame>{children}</SiteFrame>
        <ClientChrome />
      </body>
    </html>
  );
}
