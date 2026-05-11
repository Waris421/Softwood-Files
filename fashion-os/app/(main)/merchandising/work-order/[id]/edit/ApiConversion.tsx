const mapOrderData = (order: any, variants: any[]) => ({
    OrderNumber: order?.OrderNumber || "",
    Style: order?.StyleCode || "",
    Customer: order?.Customer || "",
    DeliveryDate: order?.DeliveryDate || "",
    Type: order?.Type || "",
    Currency: order?.Currency || "",
    Price: order?.Price || 0,
    ExcessCut: order?.ExcessCut || 3,
    Quantity: variants.reduce((sum, variant) => sum + (variant.Quantity || 0), 0),
});

const mapVariantData = (variants = []) => ({
    items: variants.map((v:any) => ({
        id: v.id || "",
        Name: v.Name || "",
        Description: v.Description || "",
        Quantity: v.Quantity || 0,
    }))
});

const mapRequirementData = (requirement = []) => ({
    items: requirement.map((r:any) => ({
        id: r.id || "",
        Inventory: r.InventoryCode || "",
        InventoryName: r.InventoryName || "",
        Variant: r.Variant || "",
        Type: r.Type || "",
        Required: r.Required || 0,
        Ordered: r.Ordered || 0,
        Received: r.Received || 0,
        Issued: r.Issued || 0,
        Adjustment: r.Adjustment || 0,
    }))
});

const mapAttachmentsData = (attachments = []) => ({
    items: attachments.map((a:any) => {
        const relativePath = a.FileUrl || "";

        const proxiedUrl = relativePath 
            ? `/api/attachment?url=${encodeURIComponent(relativePath)}` 
            : "";

            return {
            AttachmentId: a.id || "",
            Description: a.Description || "",
            FileUrl: proxiedUrl,
            FileName: a.FileName || "",
            CanEdit: a.CanEdit ?? true,
        }
    })
});

export const convertAPIDataToFormData = (apiData: any) => {
    if (!apiData) return {};

    const { Order, Variants=[], Requirement=[], Attachments=[] } = apiData;
    
    return {
        Order: mapOrderData(Order, Variants),
        Variant: mapVariantData(Variants),
        Requirement: mapRequirementData(Requirement),
        attachment: mapAttachmentsData(Attachments),
    };
}