import Parent from './Parent';

type Props = {
    params: Promise<{ id: string }>;
}

const page = async ({ params }: Props) => {
    const { id } = await params;
    return <Parent id={Number(id)} />;
}

export default page;
