import Image from "next/image";
import Link from "next/link";
import {BarChart3, CalendarDays, Factory, ShieldCheck, ShoppingCart, Wallet, BriefcaseBusiness} from "lucide-react";
import Marketing from "@/public/Marketing.png";
import Planning from "@/public/Planning.png";
import Procurement from "@/public/Procurement.png";
import Production from "@/public/Production.png";
import QualityControl from "@/public/Quality Control.png";
import Finance from "@/public/Finance.png";
import HumanResource from "@/public/Human Resource.png";

const modules = [
  { id: 3, src: Procurement, href: '/mmc', title: 'Procurement', icon: ShoppingCart, color: "text-blue-500", size: "col-span-1" },
  { id: 2, src: Planning, href: '/planning', title: 'Planning', icon: CalendarDays, color: "text-purple-500", size: "col-span-1" },
  { id: 4, src: Production, href: '/productivity', title: 'Production', icon: Factory, color: "text-orange-500", size: "col-span-1" },
  { id: 5, src: QualityControl, href: '/quality', title: 'Quality Control', icon: ShieldCheck, color: "text-green-500", size: "col-span-1" },
  { id: 1, src: Marketing, href: '/marketing', title: 'Marketing', icon: BarChart3, color: "text-pink-500", size: "col-span-1" },
  { id: 6, src: Finance, href: '/finance', title: 'Finance', icon: Wallet, color: "text-emerald-500", size: "col-span-1" }, 
  { id: 7, src: HumanResource, href: '/hr', title: 'Human Resource', icon: BriefcaseBusiness, color: "text-pink-400", size: "col-span-1" }, 
]

const Page = () => {
  return (
    <div className="min-h-screen bg-base-100 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to Fashion OS</h1>
        <p className="text-muted-foreground">Please select a module.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={module.href}
            className={`group relative overflow-hidden rounded-xl border border-base-300 bg-base-100 p-4 transition-all hover:shadow-lg hover:border-primary/50 ${module.size} h-32 md:h-40`}
          >
            <div className="absolute inset-0 z-0 opacity-20 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-40">
              <Image
                src={module.src}
                alt={module.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className={`p-2 rounded-lg bg-base-100 w-fit shadow-sm`}>
                <module.icon className={`w-10 h-10 ${module.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{module.title}</h3>
                <p className="text-xs opacity-60">Go to module →</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Page