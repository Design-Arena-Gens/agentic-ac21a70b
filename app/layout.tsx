import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const font = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Raven Transition Showcase",
  description: "Cinematic raven-inspired transition between two stills."
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className="bg-black antialiased">
      <body className={font.className}>{children}</body>
    </html>
  );
}
