import type { Metadata } from "next";
import "@/app/globals.css";
import NavBar from "@/_components/Navbar/NavBar";

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
    <div>
      <NavBar
      pageName="productivity"
      />
      <main className="w-full p-4">
        {children}
      </main>
    </div>
  );
}
