import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { BottomNav } from "@/components/BottomNav";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Paisa Pal - Expense Tracker",
  description: "Track expenses, stick to budgets, earn coins. Your fun way to save.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen antialiased">
        <ExpenseProvider>
          <div className="min-h-screen pb-20 max-w-lg mx-auto">
            {children}
          </div>
          <BottomNav />
        </ExpenseProvider>
      </body>
    </html>
  );
}
