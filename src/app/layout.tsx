import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DatabaseProvider } from "@/components/providers/DatabaseProvider";
import { OnboardingGate } from "@/components/providers/OnboardingGate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FMK",
  description: "Fuck, Marry, Kill - The Party Game",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FMK",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen safe-top safe-bottom`}
      >
        <DatabaseProvider>
          <OnboardingGate>{children}</OnboardingGate>
        </DatabaseProvider>
      </body>
    </html>
  );
}
