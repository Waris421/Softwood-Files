'use client';

import StyleForm from "./StyleForm";
import VariantForm from "./VariantForm";
import RouteForm from "./RouteForm";
import { FormProvider, useFormRegistry } from "./FormContext";
import { Layers, MapPinned } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs";
import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";

function GlobalSubmitButton() {
    const { getCombinedData, validateAll } = useFormRegistry();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const allValid = validateAll();
        if (!allValid) return ;
        
        //Data is valid now
        const payload = getCombinedData();

        console.log(payload);
    }

    return (
        <button
            onClick={handleSubmit}
            className={`${THEME.ButtonBasic} w-full h-full mt-2`}
        >
            Save
        </button>
    )

}

function LoadingContainer({ children }: { children: React.ReactNode }) {
    const { isAnyLoading } = useFormRegistry();

    return (
        <div className="relative">
            {isAnyLoading && (
                <div className="absolute inset-0 bg-white/50 z-50"><LoadingIcon /></div>
            )}
            {children}
        </div>
    );
}

export default function ParentContainer() {    
    return (
        <FormProvider>
            <LoadingContainer>
                <div className="flex flex-col min-h-screen">
                    <Tabs defaultValue="variant" className="w-full px-4 pb-2">
                        <div className="sticky top-16 z-30 opacity-90 border-b border-base-200 px-4">
                            <header className="py-4">
                                <StyleForm>
                                    <GlobalSubmitButton />
                                </StyleForm>
                            </header>

                            <TabsList className="grid w-full grid-cols-2 h-12" variant="line">
                                <TabsTrigger value="variant" className="gap-2">
                                    <Layers size={18} />
                                    <span className="hidden sm:inline">Variant Details</span>
                                    <span className="sm:hidden">Variant</span>
                                </TabsTrigger>
                                <TabsTrigger value="route" className="gap-2">
                                    <MapPinned size={18} />
                                    <span className="hidden sm:inline">Route Details</span>
                                    <span className="sm:hidden">Route</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="mt-4 px-4">
                            <TabsContent value="variant">
                                <VariantForm />
                            </TabsContent>
                            <TabsContent value="route">
                                <RouteForm />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </LoadingContainer>
        </FormProvider>
    )
}
