const mapInventoryData = (inventory=[]) => ({
    items: inventory.map((i: any) => ({
        id: i.id || "",
        Inventory: i.Inventory || "",
        InventoryName: i.InventoryName || "",
        Variant: i.Variant || "",
        Quantity: i.POQuantity || "",
        Unit: i.Unit || "",
        Price: i.Price || "",
        Currency: i.Currency || "",
        Details: i.Details?.map((d:any) => ({
            WorkOrder: d.WorkOrder || "",
            StyleCode: d.StyleCode || "",
            Customer: d.Customer || "",
            Merchandiser: d.Merchandiser || "",
            DetailsQuantity: d.AllocatedQty || "",
        }))
    }))
});

export const convertAPIDataToFormData = (apiData: any) => {
    if (!apiData) return {};

    const InventoryData = apiData || [];

    return {
        Inventory: mapInventoryData(InventoryData),
    };
}