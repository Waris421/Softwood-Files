import { redirect } from 'next/navigation';
// Send the user to the edit page after making a new PO
export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/mmc/purchase-order/${id}/edit`);
}
