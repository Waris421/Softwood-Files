import { Metadata } from "next";

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
        <div>{code}</div>
    )
}

export default page