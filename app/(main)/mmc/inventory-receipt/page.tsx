import { Metadata } from 'next'
import InventoryReceipts from './InventoryReceipts';

export const metadata: Metadata = {
  title: 'Inventory Receipts',
  description: 'Inventory Receipts',
}

const page = () => {
    return (
        <InventoryReceipts />
    )
}

export default page;