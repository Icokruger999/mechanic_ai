import type { Metadata } from "next";
import "./globals.css?v=3";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <style dangerouslySetInnerHTML={{__html: `
          body { font-size: 14px !important; }
          .hero-title-large { font-size: 3.5rem !important; }
          .hero-description { font-size: 0.9rem !important; }
          .login-button-large, .create-account-button-large { padding: 0.6rem 1.75rem !important; font-size: 0.75rem !important; }
          .chat-title { font-size: 1.5rem !important; }
          .chat-subtitle { font-size: 0.8rem !important; }
          .message { padding: 0.875rem 1.25rem !important; font-size: 0.875rem !important; }
          .input-wrapper { padding: 0.65rem 0.875rem !important; }
          .chat-textarea { font-size: 0.875rem !important; min-height: 40px !important; }
          .send-button { padding: 0.55rem 1.1rem !important; font-size: 0.8125rem !important; }
          .action-btn { padding: 0.45rem 0.8rem !important; font-size: 0.8125rem !important; }
          .credits-text { font-size: 0.8125rem !important; }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
