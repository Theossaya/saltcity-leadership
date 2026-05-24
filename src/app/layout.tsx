import type { Metadata } from "next";
import "./globals.css";

const themeClass = "theme-warm-berry";

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
    <html lang="en" className={`${themeClass} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
