import { Metadata } from "next";
import ParentContainer from "./Parent";

export const metadata: Metadata = {
  title: 'Updating Style Card',
  description: 'Updating Style Card',
}

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

const page = async ({ params }: PageProps) => {
    const { code } = await params;

    return (
        <div>
            <ParentContainer 
                code={code}
            />
        </div>
    )
}

export default page