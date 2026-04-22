import { Metadata } from 'next'
import InventoryCards from './InventoryCards'

export const metadata: Metadata = {
  title: 'Inventory Cards',
  description: 'Inventory Cards',
}

const page = () => {
    return (
        <InventoryCards />
    )
}

export default page;