import { Metadata } from "next";
import ConsumptionForm from "./Form";

export const metadata: Metadata = {
  title: 'Updating Thread Consumption',
  description: 'Updating Thread Consumption',
}

interface PageProps {
  params: Promise<{
    id: number;
  }>;
}

const page = async ({ params }: PageProps) => {
    const { id } = await params;
    return (
        <ConsumptionForm 
            pk={id}
        />
    )
}

export default page