import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "RTI Portal | Professional Government Dashboard",
  description: "Advanced Right to Information Application Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
