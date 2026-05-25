export interface DropdownOption {
    value: string;
    label: string;
}

export interface DropDownProps {
    apiUrl?: string;
    isStatic?: boolean;
    staticOptions?: any[];
    widthClass?: string;
    placeholder?: string;
    inputName: string;
    onSelect?: (option: any) => void;
    defaultValue?: any;
    isRequired?: boolean;
}

export interface ApiOption {
    value: string | number;
    text: string;
}