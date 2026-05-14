import PODeleteForm from "./Form";

type Props = { params: Promise<{ id: string }> }

export default async function DeletePOPage({ params }: Props) {
    const { id } = await params;
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <PODeleteForm id={id} />
        </div>
    );
}
