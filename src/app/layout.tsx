import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/providers/toaster"
import { Metadata } from "next";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PsiAgend - Tu Clínica Infantil",
  description: "Agenda y administra tus citas de psicología infantil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${nunito.variable}`}>
      <body className="antialiased min-h-screen bg-purple-50/30 selection:bg-primary/20 font-sans">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
