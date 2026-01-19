import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import ToasterProvider from "@/components/ui/ToasterProvider"; // ✅ Import Provider

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Echha | Manifest Your Wishes",
  description: "A digital sanctuary for intentional curation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className} suppressHydrationWarning={true}>
        <AuthProvider>
           <ToasterProvider /> {/* ✅ Added Notification System */}
           <Navbar />
           <main className="pt-20 min-h-screen bg-black text-white">
             {children}
           </main>
        </AuthProvider>
      </body>
    </html>
  );
}