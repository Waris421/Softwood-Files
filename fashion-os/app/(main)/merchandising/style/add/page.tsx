import { Metadata } from 'next';
import ParentConatiner from './Parent';

export const metadata: Metadata = {
  title: 'Style Card Addition',
  description: 'Style Card Addition',
}

const page = () => {
    return (
        <ParentConatiner />
    )
}

export default page