import { Metadata } from 'next'
import StyleCards from './StyleCards';

export const metadata: Metadata = {
  title: 'Style Cards',
  description: 'Style Cards',
}

const page = () => {
    return (
        <StyleCards />
    )
}

export default page;