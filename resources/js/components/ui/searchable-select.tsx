import React from 'react';
import Select, { Props as SelectProps } from 'react-select';

interface Option {
    value: string | number;
    label: string;
}

interface SearchableSelectProps extends Omit<SelectProps<Option, false>, 'onChange' | 'value'> {
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    options: Option[];
    placeholder?: string;
    isClearable?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    isClearable = true,
    ...props
}) => {
    const selectedOption = options.find((opt) => opt.value == value) || null;

    return (
        <Select
            className="searchable-select-container"
            classNamePrefix="searchable-select"
            value={selectedOption}
            onChange={(opt) => onChange(opt ? opt.value : null)}
            options={options}
            placeholder={placeholder}
            isClearable={isClearable}
            unstyled
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            classNames={{
                control: ({ isFocused }) =>
                    `flex min-h-[38px] rounded-md border text-sm transition-all bg-white dark:bg-gray-800 ${
                        isFocused
                            ? 'border-blue-600 ring-1 ring-blue-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`,
                valueContainer: () => 'px-3 gap-1',
                placeholder: () => 'text-gray-400 dark:text-gray-500',
                input: () => 'text-gray-900 dark:text-white',
                singleValue: () => 'text-gray-900 dark:text-white',
                menu: () => 'mt-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-[9999] overflow-hidden',
                menuList: () => 'py-1',
                option: ({ isFocused, isSelected }) =>
                    `px-3 py-2 text-sm cursor-pointer transition-colors ${
                        isSelected
                            ? 'bg-blue-600 text-white'
                            : isFocused
                            ? 'bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`,
                noOptionsMessage: () => 'p-3 text-sm text-gray-500 dark:text-gray-400',
                indicatorSeparator: () => 'bg-gray-200 dark:bg-gray-700 my-2',
                dropdownIndicator: () => 'px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                clearIndicator: () => 'px-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400',
                loadingIndicator: () => 'text-blue-600',
            }}
            {...props}
        />
    );
};

export default SearchableSelect;
