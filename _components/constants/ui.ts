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
        btn rounded-lg border-none bg-indigo-50 text-indigo-900 hover:bg-indigo-100
        dark:bg-slate-800 dark:text-indigo-200 dark:hover:bg-slate-700
        transition-all duration-150 active:scale-95 active:shadow-inner
    `,
    ButtonSecondarySelected: `
        btn btn-sm rounded-lg border-none bg-indigo-200 text-indigo-950 scale-95 shadow-inner
        dark:bg-indigo-900 dark:text-indigo-50
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

    TextInput: 'input w-full rounded-lg bg-gray-300 dark:bg-gray-800',
    TextInputReadOnly: 'input w-full rounded-lg bg-gray-400 dark:bg-gray-700',
    DropDown: 'w-full justify-between bg-gray-300 dark:bg-gray-800',
    Slider: 'flex-1 w-full min-w-30 rounded-lg bg-gray-300 dark:bg-gray-800',
    CheckBox: 'checkbox rounded-lg checkbox-lg bg-gray-300 dark:bg-gray-800',
    
    HyperLink: 'label-text-alt link link-hover',
    ErrorText: 'label-text-alt flex items-center gap-1 text-red-500',
}