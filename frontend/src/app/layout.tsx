import "./globals.css";
import React from "react";

export const metadata = {
  title: "Shopify WhatsApp AI",
  description: "Admin panel for WhatsApp + AI automation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
