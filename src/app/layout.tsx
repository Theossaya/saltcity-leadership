import type { Metadata, Viewport } from "next";
import "./globals.css";

const themeClass = "theme-warm-berry";
const appName = "SaltCity Leadership";
const appDescription =
  "Church leadership operations for reports, care, tasks, announcements, and events.";

export const metadata: Metadata = {
  title: appName,
  applicationName: appName,
  description: appDescription,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SaltCity",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#6E2A40",
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
