import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "@/app/globals.css";
import NavBar from "@/_components/Navbar/NavBar";
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
  title: "Fashion OS",
  description: "Fashion OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} bg-base-200 antialiased h-full`}
      >
        <div className="relative w-full min-h-screen dark:text-gray-200">
          <div className="absolute inset-0 z-0">
            <Aurora/>
          </div>
          <div className="relative z-10 w-full min-h-screen">
            <NavBar></NavBar>
            <main className="w-full p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
