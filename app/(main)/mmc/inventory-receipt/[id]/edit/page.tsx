import { Metadata } from "next";
import ParentContainer from "./Parent";

export const metadata: Metadata = {
    title: 'Updating Inventory Receipt',
    description: 'Updating Inventory Receipt',
}

interface PageProps {
    params: Promise<{
        id: number;
    }>;
}

const page = async ({ params }: PageProps) => {
    const { id } = await params;

    return (
        <ParentContainer id={id}/>
    )
}

export default page