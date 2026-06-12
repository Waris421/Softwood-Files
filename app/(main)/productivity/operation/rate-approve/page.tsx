import { Metadata } from 'next';
import Parent from './Parent';

export const metadata: Metadata = {
  title: 'Unapproved Operation Rates',
  description: 'Unapproved Operation Rates',
}

const page = () => {
    return (
        <Parent />
    )
}

export default page