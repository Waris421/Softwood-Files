import type { Metadata } from "next";
import NavBar from "@/_components/Navbar/NavBar";

export const metadata: Metadata = {
  title: "Fashion OS",
  description: "By Softwood Private Limited",
};

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar pageName="finance" />
      <main className="w-full p-4">
        {children}
      </main>
    </div>
  );
}
