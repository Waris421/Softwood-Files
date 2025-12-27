import Image from "next/image";
import Link from "next/link";
import Marketing from "@/public/Marketing.png";
import Planning from "@/public/Planning.png";
import Procurement from "@/public/Procurement.png";
import Production from "@/public/Production.png";
import QualityControl from "@/public/Quality Control.png";

const Page = () => {
  const imageData = [
    { id: 3, src: Procurement, href: '/apparel', alt: 'Procurement', title: 'Procurement'},
    { id: 2, src: Planning, href: '/planning', alt: 'Planning', title: 'Planning'},
    { id: 4, src: Production, href: '/productivity', alt: 'Production', title: 'Production'},
    { id: 5, src: QualityControl, href: '/quality', alt: 'Quality Control', title: 'Quality Control'},
    { id: 1, src: Marketing, href: '/marketing', alt: 'Marketing', title: 'Marketing'},
  ]
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
        {imageData.map((img) => (
          <Link 
            key={img.id} 
            href={img.href}
            className="group relative block aspect-square overflow-hidden rounded-xl bg-base-300"
          >
            <Image
              src={img.src}
              alt={img.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <h3 className="pointer-events-none text-center text-xxl font-bold tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {img.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Page