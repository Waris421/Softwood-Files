import { Metadata } from "next";
import OfficeUpdateForm from "./Form";

export const metadata: Metadata = {
  title: 'Updating Office Details',
  description: 'Updating Office Details',
}

interface PageProps {
  params: Promise<{
    id: number;
  }>;
}

const page = async ({ params }: PageProps) => {
    const { id } = await params;

    return (
        <OfficeUpdateForm pk={id}/>
    )
}

export default page