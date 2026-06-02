import { Metadata } from 'next';
import ParentContainer from './Parent';

export const metadata: Metadata = {
  title: 'Purchase Receipt Addition',
  description: 'Purchase Receipt Addition',
}

const page = () => {
    return (
        <ParentContainer />
    )
}

export default page