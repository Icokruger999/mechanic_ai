import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mechanic AI - Your AI Assistant",
  description: "Your intelligent mechanic assistant powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
