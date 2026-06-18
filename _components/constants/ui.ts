export const THEME = {
    ButtonBasic: `
        btn rounded-lg border-none text-white shadow-md 
        bg-linear-to-b from-indigo-500 to-slate-700 
        hover:from-indigo-600 hover:to-slate-900 
        dark:from-indigo-600 dark:to-slate-900 dark:hover:from-indigo-500 dark:hover:to-black
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonBasicSelected: `
        btn btn-sm rounded-lg border-none text-white shadow-inner scale-95
        bg-linear-to-b from-indigo-700 to-slate-900
        dark:from-indigo-800 dark:to-black
    `,

    ButtonSecondary: `
        btn rounded-lg border-none text-white shadow-md
        bg-linear-to-b from-emerald-500 to-teal-700
        hover:from-emerald-600 hover:to-teal-800
        dark:from-teal-600 dark:to-slate-800 dark:hover:from-teal-500 dark:hover:to-teal-900
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonSecondarySelected: `
        btn btn-sm rounded-lg border-none text-white shadow-inner scale-95
        bg-linear-to-b from-teal-700 to-emerald-900
        dark:from-teal-800 dark:to-black
    `,

    ButtonOutLine: `
        btn btn-outline rounded-lg border-slate-300 text-slate-700
        hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700
        dark:text-slate-300 dark:hover:bg-slate-800
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonOutLineSelected: `
        btn btn-outline btn-sm rounded-lg border-slate-500 text-slate-900 bg-slate-200 scale-95 shadow-inner
        dark:border-slate-400 dark:text-white dark:bg-slate-700
    `,

    TextInput: 'input w-full rounded-lg bg-gray-200 dark:bg-gray-800 hover:ring-2 hover:shadow-md transition-shadow placeholder:text-[10px]',
    TextInputReadOnly: 'input w-full rounded-lg bg-gray-400 dark:bg-gray-700',
    DropDown: 'w-full h-10 rounded-lg justify-between bg-gray-200 dark:bg-gray-800',
    Slider: 'flex-1 w-full min-w-30 rounded-lg bg-gray-300 dark:bg-gray-800',
    CheckBox: 'checkbox rounded-lg checkbox-lg bg-gray-300 dark:bg-gray-800',
    
    HyperLink: 'label-text-alt link link-hover',
    ErrorText: 'label-text-alt flex items-center gap-1 text-red-500',

    Table: {
        Wrapper: "w-full space-y-4 [--base-200:theme(colors.slate.100)] [--base-300:theme(colors.slate.200)] dark:[--base-200:theme(colors.slate.800)] dark:[--base-300:theme(colors.slate.700)]",
        HeaderRow: "bg-[var(--base-200)]",
        TableContainer: "overflow-x-auto rounded-lg border border-[var(--base-300)]",
        RowHover: "hover:bg-slate-500/10 dark:hover:bg-slate-400/10",
        Footer: "mt-4 p-4 bg-base-200 rounded-lg border border-base-300",
    },

    Background: {
        Base: "bg-gray-100 dark:bg-gray-900",
        Highlighted100: "bg-gray-200 dark:bg-gray-800",
        Highlighted200: "bg-gray-300 dark:bg-gray-700",
    },

    Text: {
        NormalText: 'text-gray-800 dark:text-gray-100',
        RedText: 'text-red-600 dark:text-red-500',
        BlueText: 'text-blue-600 dark:text-blue-500',
        GrayText: 'text-gray-600 dark:text-gray-400',
        GreenText: 'text-green-600 dark:text-green-500',
        AmberText: 'text-amber-500 dark:text-amber-400',
    }
}