import { Metadata } from 'next';
import ParentContainer from './Parent';

export const metadata: Metadata = {
  title: 'Work Order Addition',
  description: 'Work Order Addition',
}

const page = () => {
    return (
        <ParentContainer />
    )
}

export default page