import { Metadata } from 'next';
import Bulletins from './Bulletins';

export const metadata: Metadata = {
  title: 'Style Bulletins',
  description: 'Style Bulletins',
}

const page = () => {
    return (
        <Bulletins />
    )
}

export default page;