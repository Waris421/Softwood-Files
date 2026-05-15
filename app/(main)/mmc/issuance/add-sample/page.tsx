import { Metadata } from 'next';
import Parent from './Parent';

export const metadata: Metadata = {
  title: 'Issuance For Samples',
  description: 'Inventory issuance for Sampling Department',
}

const page = () => {
    return (
        <Parent />
    )
}

export default page