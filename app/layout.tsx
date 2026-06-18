import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlwaysBooked AI",
  description: "AI receptionist dashboard for local-service businesses."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
