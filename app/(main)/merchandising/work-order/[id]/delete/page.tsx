import { Metadata } from "next";
import OrderDeleteForm from "./Form";

export const metadata: Metadata = {
  title: 'Deleting Work Order',
  description: 'Deleting Work Order',
}

interface PageProps {
    params: Promise<{
        id: number;
    }>;
}

const page = async ({ params }: PageProps) => {
    const { id } = await params;

    return (
        <OrderDeleteForm id={id} />
    )
}

export default page