import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Layout from "../components/Layout";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "ITA Finance Manager",
  description: "Modern financial management for ITA INNOVATE",
};

import { AuthProvider } from "../lib/auth-context";
import { ProductProvider } from "../lib/product-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          <ProductProvider>
            <Layout>{children}</Layout>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
