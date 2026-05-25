import POCopyForm from "./Form";

type Props = { params: Promise<{ id: string }> }

export default async function CopyPOPage({ params }: Props) {
    const { id } = await params;
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <POCopyForm id={id} />
        </div>
    );
}
