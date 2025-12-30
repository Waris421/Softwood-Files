import * as z from "zod";

const rowSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    Operation: z.string().min(1, "Required"),
    Frequency: z.number().min(1),
    StitchType: z.string().min(1, "Required"),
    Factor: z.number().min(1),
    ThreadType: z.string().min(1, "Required"),
    Count: z.string().min(1, "Required"),
    Consumption: z.number().min(1, "Required"),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.infer<typeof formSchema>;

export { formSchema };
export type { FormValues };
