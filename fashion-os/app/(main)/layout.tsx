import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/_components/generic/ThemeProvider";
import { ShortcutProvider } from "@/_components/shortcuts/ShortcutContext";
import BackgroundController from "@/_components/background/BackgroundController";

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
  description: "By Softwood Private Limited",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} bg-base-200 antialiased h-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ShortcutProvider>
            <div className="relative w-full min-h-screen">
              <div className="absolute inset-0 z-0">
                <BackgroundController />
              </div>
              <div className="relative z-10 w-full min-h-screen">
                {children}
              </div>
            </div>
          </ShortcutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
