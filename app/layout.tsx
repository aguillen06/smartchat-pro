import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Symtri AI SmartChat - AI-Powered Chat Support for Your Website",
  description: "Convert more visitors into customers with intelligent chatbots that capture leads 24/7. Deploy in minutes, not months. Start your free trial today!",
  keywords: "AI chatbot, customer support, lead generation, small business, chat widget, Symtri AI, SmartChat, Texas",
  authors: [{ name: "Symtri AI" }],
  creator: "Symtri AI",
  publisher: "Symtri AI",
  openGraph: {
    title: "Symtri AI SmartChat - AI Chat Support",
    description: "Convert more visitors into customers with AI-powered chat support. 14-day free trial, no credit card required.",
    url: "https://smartchat-pro.vercel.app",
    siteName: "Symtri AI SmartChat",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Symtri AI SmartChat",
    description: "AI-powered chat support for your website. Convert visitors into customers 24/7. Powered by Symtri AI.",
    creator: "@symtri_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
