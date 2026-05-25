import ParentContainer from "./Parent";

type Props = { params: Promise<{ id: string }> }

export default async function EditPOPage({ params }: Props) {
    const { id } = await params;
    return <ParentContainer id={id} />;
}
