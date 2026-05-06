import type { Metadata } from "next";
import type { ReactNode } from "react";
import NavBar from "@/_components/Navbar/NavBar";

export const metadata: Metadata = {
  title: "Fashion OS",
  description: "By Softwood Private Limited",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <NavBar pageName="marketing" />
      <main className="w-full p-4">{children}</main>
    </div>
  );
}
