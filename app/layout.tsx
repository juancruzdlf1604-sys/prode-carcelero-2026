import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Prode Carcelero 2026 — Club San Carlos Rugby",
  description: "El prode oficial del Mundial 2026 del Club San Carlos Rugby. ¡Participá y ganá!",
  openGraph: {
    title: "Prode Carcelero 2026",
    description: "El prode oficial del Mundial 2026 del Club San Carlos Rugby",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} antialiased bg-oscuro text-white`}>
        {children}
      </body>
    </html>
  );
}
