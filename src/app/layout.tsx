import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Zura — Meet Someone Special",
  description: "The dating app for Algeria, Morocco & Tunisia. Find your match today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F5]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
