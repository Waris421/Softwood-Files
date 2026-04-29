const mapStyleData = (style: any) => ({
    Code: style?.StyleCode || "",
    Name: style?.StyleName || "",
    Notes: style?.Notes || "",
    Customer: style?.Customer || "",
    Category: style?.Category || ""
});

const mapVariantData = (variants = []) => ({
    items: variants.map((v:any) => ({
        id: v.id || "",
        Variant: v.VariantCode || ""
    }))
});

const mapConsumptionData = (consumption = []) => ({
    items: consumption.map((c:any) => ({
        id: c.id || "",
        Inventory: c.InventoryCode || "",
        InventoryName: c.InventoryName || "",
        InvBaseUnit: c.InventoryUnit,
        Consumption: c.Consumption || 1,
        Unit: c.Unit || "",
        Type: c.Type || "BW",
        HasVariant: c.HasVariant || false,
        SizeDetails: c.SizeDetails || "",
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
            CanEdit: a.CanEdit || true,
        }
    })
});

const mapRouteData = (style: any) => ({
    RouteId: style?.RoutePreset?.toString() || ""
});

export const convertAPIDataToFormData = (apiData: any) => {
    if (!apiData) return {};

    const { Style, Variants=[], Consumption=[], Attachments=[] } = apiData;

    return {
        style: mapStyleData(Style),
        variant: mapVariantData(Variants),
        route: mapRouteData(Style),
        consumption: mapConsumptionData(Consumption),
        attachment: mapAttachmentsData(Attachments),
    };
}