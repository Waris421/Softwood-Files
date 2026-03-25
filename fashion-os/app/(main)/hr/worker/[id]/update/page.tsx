import { Metadata } from "next";
import WorkerUpdateForm from "./Form";

export const metadata: Metadata = {
  title: 'Updating Worker Details',
  description: 'Updating Worker Details',
}

interface PageProps {
  params: Promise<{
    id: number;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  
  return (
      <WorkerUpdateForm 
        pk={id}
      />
  )
}

export default page

