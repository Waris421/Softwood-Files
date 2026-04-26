import type { Metadata } from "next";
import "@/app/globals.css";
import NavBar from "@/_components/Navbar/NavBar";

export const metadata: Metadata = {
  title: "Fashion OS",
  description: "By Softwood Private Limited",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar pageName="marketing" />
      <main className="w-full p-4">{children}</main>
    </div>
  );
}
