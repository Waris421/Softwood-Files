import { Metadata } from "next";
import StyleDeleteForm from "./Form";

export const metadata: Metadata = {
  title: 'Deleting Style Card',
  description: 'Deleting Style Card',
}

interface PageProps {
    params: Promise<{
        code: string;
    }>;
}

const page = async ({ params }: PageProps) => {
    const { code } = await params;

    return (
        <StyleDeleteForm
            code={code}
        />
    )
}

export default page