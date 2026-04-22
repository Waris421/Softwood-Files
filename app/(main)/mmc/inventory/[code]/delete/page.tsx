import { Metadata } from "next";
import InventoryDeleteForm from "./Form";

export const metadata: Metadata = {
  title: 'Deleting Inventory Card',
  description: 'Deleting Inventory Card',
}

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

const page = async ({ params }: PageProps) => {
    const { code } = await params;

    return (
        <InventoryDeleteForm 
            code={code}
        />
    )
}

export default page