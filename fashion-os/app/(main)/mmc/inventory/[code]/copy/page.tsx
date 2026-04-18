import { Metadata } from "next";
import InventoryDuplicateForm from "./Form";

export const metadata: Metadata = {
  title: 'Copying Inventory Card',
  description: 'Copying Inventory Card',
}

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

const page = async ({ params }: PageProps) => {
    const { code } = await params;

    return (
        <InventoryDuplicateForm 
          code={code}
        />
    )
}

export default page