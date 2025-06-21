import type { Metadata } from "next";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Solv: Wallet Health Hub",
  description: "Unified wallet management for Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen")}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
