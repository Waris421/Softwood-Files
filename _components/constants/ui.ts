export const THEME = {
    ButtonBasic: `
        btn rounded-lg border-none text-white shadow-md 
        bg-linear-to-b from-indigo-500 to-slate-700 
        hover:from-indigo-600 hover:to-slate-900 
        dark:from-indigo-600 dark:to-slate-900 dark:hover:from-indigo-500 dark:hover:to-black
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonBasicSelected: `
        btn rounded-lg border-none text-white shadow-md 
        bg-linear-to-b from-indigo-700 to-slate-900
        dark:from-indigo-700 dark:to-black
        transition-all duration-150 scale-95 shadow-inner
    `,
    ButtonSecondary: `
        btn rounded-lg border-none text-white shadow-md
        bg-linear-to-b from-emerald-500 to-teal-700
        hover:from-emerald-600 hover:to-teal-900
        dark:from-emerald-600 dark:to-teal-900 dark:hover:from-emerald-500 dark:hover:to-black
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonSecondarySelected: `
        btn rounded-lg border-none text-white shadow-md
        bg-linear-to-b from-emerald-700 to-teal-900
        dark:from-emerald-700 dark:to-black
        transition-all duration-150 scale-95 shadow-inner
    `,
    ButtonOutLine: `
        btn btn-outline rounded-lg border-slate-300 text-slate-700
        hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700
        dark:text-slate-300 dark:hover:bg-slate-800
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonOutLineSelected: `
        btn btn-outline rounded-lg border-slate-400 text-slate-900
        bg-slate-100 dark:border-slate-500
        dark:text-slate-100 dark:bg-slate-800
        transition-all duration-150 scale-95
    `,

    TextInput: 'input w-full rounded-lg bg-gray-300 dark:bg-gray-800 hover:ring-2 hover:shadow-md transition-shadow placeholder:text-[10px]',
    TextInputReadOnly: 'input w-full rounded-lg bg-gray-400 dark:bg-gray-700',
    DropDown: 'w-full h-10 rounded-lg justify-between bg-gray-300 dark:bg-gray-800',
    Slider: 'flex-1 w-full min-w-30 rounded-lg bg-gray-300 dark:bg-gray-800',
    CheckBox: 'checkbox rounded-lg checkbox-lg bg-gray-300 dark:bg-gray-800',
    
    HyperLink: 'label-text-alt link link-hover',
    ErrorText: 'label-text-alt flex items-center gap-1 text-red-500',

    Table: {
        Wrapper: 'w-full space-y-4',
        TableContainer: 'overflow-x-auto rounded-lg border border-base-300',
        HeaderRow: 'bg-base-200',
        RowHover: 'hover:bg-base-100',
    },

    Text: {
        RedText:  'text-red-600 dark:text-red-400',
        GrayText: 'text-gray-900 dark:text-gray-100',
        BlueText: 'text-blue-600 dark:text-blue-400',
    }
}
