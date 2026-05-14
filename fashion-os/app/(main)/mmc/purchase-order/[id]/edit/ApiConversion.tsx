// Its only job is to take the raw data Django sends back and rename/reshape it into the format our forms expect.

const mapHeaderData = (order: any) => ({
    id:           order?.id           || null,
    Supplier:     order?.Supplier     || '',
    OrderDate:    order?.OrderDate    || '',
    DeliveryDate: order?.DeliveryDate || '',
    Tax:          order?.Tax          ?? 0,
});

const mapInventoryData = (inventory: any[] = []) => ({
    items: inventory.map((row) => ({
        id:            row.id            || '',
        Inventory:     row.Inventory     || '',
        InventoryName: row.InventoryName || '',
        Variant:       row.Variant       || '',
        Quantity:      row.Quantity      || 1,
        Price:         row.Price         || 0,
        Currency:      row.Currency      || '',
        Forex:         row.Forex         || 1,
    }))
});
const mapAllocationsData = (allocations: any[] = []) => {
    const map: Record<string, { WorkOrder: number; Quantity: number }[]> = {};
    allocations.forEach((a: any) => {
        const key = String(a.allocId);
        if (!map[key]) map[key] = [];
        map[key].push({ WorkOrder: a.WorkOrder, Quantity: a.Quantity });
    });
    return map;
};

export const convertAPIDataToFormData = (apiData: any) => {
    if (!apiData) return {};

    return {
        header:      mapHeaderData(apiData.order),
        inventory:   mapInventoryData(apiData.inventory),
        allocations: mapAllocationsData(apiData.allocations),
    };

};
