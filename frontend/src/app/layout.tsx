import type { Metadata } from "next";
import { Geist_Mono, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockSim — Paper Trading Simulator",
  description:
    "Learn to invest with $100,000 in virtual cash. Practice trading stocks risk-free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        {/* Prevent flash: apply saved theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');})()`,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
