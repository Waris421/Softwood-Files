import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "@/app/globals.css";
import Aurora from "@/_components/Aurora/Aurora";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Practice App",
  description: "Next Practice App",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} bg-base-200 min-h-screen`}
      >
        <div className="relative w-full min-h-screen dark:text-gray-200">
          <div className="absolute inset-0 z-0">
            <Aurora/>
          </div>
          <div className="relative z-10 w-full min-h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
