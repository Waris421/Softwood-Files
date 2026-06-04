import { Metadata } from 'next'
import Issuances from './Issuances';

export const metadata: Metadata = {
  title: 'Inventory Issuances',
  description: 'Inventory Issuances',
}

const page = () => {
    return (
        <Issuances />
    )
}

export default page;