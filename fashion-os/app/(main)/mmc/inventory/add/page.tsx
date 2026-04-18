import { Metadata } from 'next';
import InventoryForm from './Form';

export const metadata: Metadata = {
  title: 'Inventory Card Addition',
  description: 'Inventory Card Addition',
}

const page = () => {
    return (
        <InventoryForm />
    )
}

export default page