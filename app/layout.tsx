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
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <style dangerouslySetInnerHTML={{__html: `
          * { font-size: 13px !important; }
          body { font-size: 13px !important; line-height: 1.5 !important; }
          h1 { font-size: 1.75rem !important; }
          h2 { font-size: 1.5rem !important; }
          h3 { font-size: 1.25rem !important; }
          button { padding: 0.5rem 0.875rem !important; font-size: 0.8125rem !important; }
          input, textarea { padding: 0.625rem 0.75rem !important; font-size: 0.875rem !important; }
          .hero-title-large { font-size: 3.5rem !important; }
          .hero-description { font-size: 0.875rem !important; }
          .login-button-large, .create-account-button-large { padding: 0.55rem 1.5rem !important; font-size: 0.7rem !important; }
          .new-chat-button { padding: 0.5rem 0.75rem !important; font-size: 0.75rem !important; }
          .chat-item { padding: 0.35rem 0.5rem !important; font-size: 0.7rem !important; }
          .message { padding: 0.875rem 1.25rem !important; font-size: 0.8125rem !important; }
          .chat-textarea { font-size: 0.8125rem !important; padding: 0.3rem 0 !important; }
          .send-button { padding: 0.5rem 1rem !important; font-size: 0.75rem !important; }
          .action-btn { padding: 0.4rem 0.75rem !important; font-size: 0.75rem !important; }
          .pricing-card { padding: 1.25rem 1rem !important; }
          .card-header { font-size: 0.625rem !important; }
          .price-number { font-size: 2rem !important; }
          .feature-list li { font-size: 0.75rem !important; padding: 0.35rem 0 !important; }
          .pricing-button { padding: 0.5rem 1rem !important; font-size: 0.7rem !important; }
          .login-box { padding: 2rem 1.75rem !important; }
          .login-title { font-size: 1.75rem !important; }
          .form-input { padding: 0.625rem 0.75rem !important; font-size: 0.8125rem !important; }
          .login-button { padding: 0.75rem !important; font-size: 0.8125rem !important; }
          .diagnostic-row { padding: 0.625rem 0 !important; }
          .component-name { font-size: 0.8125rem !important; }
          .severity-badge { padding: 0.25rem 0.625rem !important; font-size: 0.625rem !important; }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
