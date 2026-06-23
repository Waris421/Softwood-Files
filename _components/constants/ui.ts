export const THEME = {
    ButtonBasic: `
        btn rounded-lg border-none text-base-content shadow-md 
        bg-linear-to-b from-indigo-500 to-slate-800 
        hover:brightness-80 
        transition-all duration-150 active:scale-85 active:shadow-inner
    `,
    ButtonBasicSelected: `
        btn btn-sm rounded-lg border-none text-base-content shadow-inner scale-95
    `,

    ButtonSecondary: `
        btn rounded-lg border-none text-base-content shadow-md
        bg-linear-to-b from-emerald-500 to-teal-700
        hover:brightness-80
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonSecondarySelected: `
        btn btn-sm rounded-lg border-none text-base-content shadow-inner scale-95
        bg-linear-to-b from-teal-700 to-emerald-900
    `,

    ButtonOutLine: `
        btn btn-outline bg-base rounded-lg border-slate-300 text-base-content
        hover:brightness-80
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonOutLineSelected: `
        btn btn-outline btn-sm rounded-lg border-slate-500
        text-slate-900 bg-slate-200 scale-95 shadow-inner
    `,
    ButtonInvisible: `
        btn btn-ghost rounded-lg text-base-content
        hover:brightness-80
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,

    TextInput: 'input w-full rounded-lg bg-base-200 hover:brightness-80 placeholder:text-[10px]',
    TextInputReadOnly: 'input w-full rounded-lg bg-base-400',
    DropDown: 'w-full h-10 rounded-lg justify-between bg-base-200',
    Slider: 'flex-1 w-full min-w-30 rounded-lg bg-base-200',
    CheckBox: 'rounded-lg bg-base-200 shrink-0',
    
    HyperLink: 'label-text-alt link link-hover',
    ErrorText: 'label-text-alt flex items-center gap-1 text-red-500',

    Table: {
        Wrapper: "w-full space-y-4 bg-base-100",
        HeaderRow: "bg-base-200",
        TableContainer: "overflow-x-auto rounded-lg border",
        RowHover: "hover:brightness-90",
        Footer: "mt-4 p-4 bg-base-200 rounded-lg border border-base-300",
    },

    Background: {
        Base: "bg-base",
        Highlighted100: "bg-base-100",
        Highlighted200: "bg-base-200",
        Highlighted300: "bg-base-300",
        Green: "bg-green-500",
        Gray: "bg-gray-500",
    },

    Text: {
        NormalText: 'text-base-content',
        RedText: 'text-error',
        BlueText: 'text-info/75',
        GrayText: 'text-base-content/30',
        GreenText: 'text-success',
        AmberText: 'text-warning',
    },

    Popover: {
        PopoverTrigger: "w-full justify-between h-9 px-3 border rounded-md text-sm font-medium shadow-sm transition-colors",
        PopoverContent: "w-[var(--radix-popover-trigger-width)] p-0 bg-base-100 border rounded-md shadow-md",
        PopoverItem: "flex items-center justify-between bg-base-300 py-2 px-3 cursor-pointer text-sm rounded-lg transition-colors",
        PopoverItemActive: "bg-success-content",
        Placeholder: "text-muted-foreground text-[9px]",
        ClearButton: "p-0.5 hover:bg-secondary rounded-sm transition-colors cursor-pointer",
        ClearIcon: "h-3.5 w-3.5 text-muted-foreground hover:text-foreground",
        ChevronIcon: "h-4 w-4 opacity-50 shrink-0",
        OptionLabel: "whitespace-normal wrap-break-word flex-1",
        CheckIcon: "ml-2 h-4 w-4 shrink-0 text-info",
    }
}