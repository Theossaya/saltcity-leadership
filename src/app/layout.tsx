import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const galano = localFont({
  src: [
    {
      path: "./fonts/galano/GalanoGrotesqueRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/galano/GalanoGrotesqueItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/galano/GalanoGrotesqueMedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/galano/GalanoGrotesqueSemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/galano/GalanoGrotesqueBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-galano",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leadership App",
  description: "Church leadership operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${galano.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
