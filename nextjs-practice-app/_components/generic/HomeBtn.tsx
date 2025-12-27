'use client'

import Image from 'next/image';
import Link from 'next/link';

const HomeButton = () => {
  return (
    <Link href="/" passHref> 
      <button className="btn btn-ghost">
        <Image
          src="/Home.svg"
          alt="Home Page"
          width={20}
          height={20}
        />
      </button>
    </Link>
  )
}

export default HomeButton