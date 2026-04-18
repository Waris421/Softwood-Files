import { Metadata } from "next";
import InventoryUpdateForm from "./Form";

export const metadata: Metadata = {
  title: 'Updating Inventory Card',
  description: 'Updating Inventory Card',
}

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

const page = async ({ params }: PageProps) => {
    const { code } = await params;

    return (
        <InventoryUpdateForm
            code={code}
        />
    )
}

export default page