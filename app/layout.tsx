import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Using Space Grotesk as display font (similar geometric feel to Satoshi, available on Google Fonts)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-satoshi",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lockdrop - Guaranteed by math, not corporations",
  description:
    "Decentralized time-capsule for time-locked audio/video messages with blockchain-enforced privacy",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Lockdrop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-dark-950 font-sans text-dark-100 antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
