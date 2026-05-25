import { Metadata } from "next";
import StyleDuplicateForm from "./Form";

export const metadata: Metadata = {
  title: 'Copying Style Card',
  description: 'Copying Style Card',
}

interface PageProps {
    params: Promise<{
        code: string;
    }>;
}

const page = async ({ params }: PageProps) => {
    const { code } = await params;

    return (
        <StyleDuplicateForm 
            code={code}
        />
    )
}

export default page