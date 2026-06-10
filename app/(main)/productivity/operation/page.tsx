import { Metadata } from 'next';
import Operations from './Operations';

export const metadata: Metadata = {
  title: 'Production Operations',
  description: 'Production Operations',
}

const page = () => {
    return (
        <Operations />
    )
}

export default page;