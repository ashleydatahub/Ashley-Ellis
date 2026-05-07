import type { Metadata } from "next";
import { Syne, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Micro Mentorship — fifteen minutes. real signal.",
  description:
    "Book a 15-minute session with an industry insider. Career change, reality check, or just map the maze.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
        style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
