import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phone Marketplace",
  description: "Buy and sell phones with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          <Navbar />
          <main className="container px-3 sm:px-4">
            {children}
          </main>
          <footer className="border-t mt-16">
            <div className="container px-3 sm:px-4 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
              <span className="order-2 sm:order-1">© {new Date().getFullYear()} PhoneMarket</span>
              <div className="order-1 sm:order-2 flex gap-4">
                <a href="/products" className="hover:underline">Browse</a>
                <a href="/auth/signup?role=seller" className="hover:underline">Sell</a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
