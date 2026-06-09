import { Metadata } from 'next';
import Parent from './Parent';

export const metadata: Metadata = {
  title: 'Issuance For Direct Material',
  description: 'Inventory issuance for Direct Material',
}

const page = () => {
    return (
        <Parent />
    )
}

export default page;