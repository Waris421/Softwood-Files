import { Metadata } from 'next'
import PurchaseDemands from './PurchaseDemands';

export const metadata: Metadata = {
  title: 'Purchase Demands',
  description: 'Managing Purchase Demands',
}

const page = () => {
    return (
        <PurchaseDemands />
    )
}

export default page;