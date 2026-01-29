import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const iosevka = localFont({
  src: "./fonts/iosevka-regular.woff2",
  variable: "--font-iosevka",
});

export const metadata: Metadata = {
  title: "SyntaxRecall",
  description: "Master your tech stack with AI-powered spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${iosevka.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <Providers>
          <div className="flex flex-col items-center min-h-screen">
            <Header />
            <main className="container flex-1 py-6 flex flex-col items-center">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
