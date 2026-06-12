import { Metadata } from 'next';
import Machines from './Machines';

export const metadata: Metadata = {
  title: 'Production Machines',
  description: 'Production Machines',
}

const page = () => {
    return (
        <Machines />
    )
}

export default page;