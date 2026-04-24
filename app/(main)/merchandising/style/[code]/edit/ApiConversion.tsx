const mapStyleData = (style: any) => ({
    Code: style?.StyleCode || "",
    Name: style?.StyleName || "",
    Notes: style?.Notes || "",
    Customer: style?.Customer || "",
    Category: style?.Category || ""
});

const mapVariantData = (variants = []) => ({
    items: variants.map((v:any) => ({
        Variant: v.VariantCode || ""
    }))
});

const mapRouteData = (style: any) => ({
    RouteId: style?.RoutePreset?.toString() || ""
});

export const convertAPIDataToFormData = (apiData: any) => {
    if (!apiData) return {};

    const { Style, Variants = [] } = apiData;

    return {
        style: mapStyleData(Style),
        variant: mapVariantData(Variants),
        route: mapRouteData(Style),
    };
}