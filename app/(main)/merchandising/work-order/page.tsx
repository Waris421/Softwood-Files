import { Metadata } from 'next'
import WorkOrders from './WorkOrder';

export const metadata: Metadata = {
  title: 'Work Orders',
  description: 'Work Orders',
}

const page = () => {
    return (
        <WorkOrders />
    )
}

export default page;