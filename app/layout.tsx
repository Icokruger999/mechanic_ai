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
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <style dangerouslySetInnerHTML={{__html: `
          body { font-size: 13px !important; }
          .chat-title { font-size: 1.75rem !important; }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
