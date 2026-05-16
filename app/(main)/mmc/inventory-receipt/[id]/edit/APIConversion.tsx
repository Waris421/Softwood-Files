const mapReceiptData = (receipt: any) => ({
    id: receipt?.id || 0,
    PONumber: receipt?.PONumber || 0,
    ReceiptDate: receipt?.ReceiptDate || "",
    Invoice: receipt?.Invoice || "",
    Vehicle: receipt?.Vehicle || "",
    Supplier: receipt?.Supplier || "",
    Bilty: receipt?.Bilty || "",
    BiltyValue: receipt?.BiltyValue || 0,
});

const mapInventoryData = (inventory=[]) => ({
    items: inventory.map((i: any) => ({
        id: i.id || "",
        Inventory: i.InventoryCode || "",
        InventoryName: i.InventoryName || "",
        Variant: i.Variant || "",
        Quantity: i.Quantity || "",
        Unit: i.Unit || "",
        Price: i.Price || "",
        Currency: i.Currency || "",
        Approval: i.Approval || false,
        QualityComments: i.QualityComments || "",
    }))
});

const mapAllocationData = (allocation=[]) => ({
    items: allocation.map((a: any) => ({
        id: a.id || "",
        RecIvId: a.RecInvId || "",
        WorkOrder: a.WorkOrder || "",
        Quantity: a.Quantity || "",
    }))
})

export const convertAPIDataToFormData = (apiData: any) => {
    if (!apiData) return {};

    const { Receipt, Inventories=[], Allocations=[] } = apiData;

    return {
        Receipt: mapReceiptData(Receipt),
        Inventories: mapInventoryData(Inventories),
        Allocations: mapAllocationData(Allocations),
    };
}