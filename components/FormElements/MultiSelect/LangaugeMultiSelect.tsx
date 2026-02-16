"use client";
import React, { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  text: string;
  selected: boolean;
}

interface DropdownProps {
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  value?: string[]; // Array of selected values
  onChange?: (selectedValues: string[]) => void; // Callback when selection changes
}

export const languageOptions = [
  { value: "ENGLISH", text: "ENGLISH" },
  { value: "AFRIKAANS", text: "AFRIKAANS" },
  { value: "NDEBELE", text: "NDEBELE" },
  { value: "SEPEDI", text: "SEPEDI" },
  { value: "SESOTHO", text: "SESOTHO" },
  { value: "SETSWANA", text: "SETSWANA" },
  { value: "siSWATI", text: "siSWATI" },
  { value: "SOUTH AFRICAN SIGN LANGUAGE", text: "SOUTH AFRICAN SIGN LANGUAGE" },
  { value: "TSHIVENDA", text: "TSHIVENDA" },
  { value: "XHOSA", text: "XHOSA" },
  { value: "XITSONGA", text: "XITSONGA" },
  { value: "ZULU", text: "ZULU" },
  { value: "OTHER", text: "OTHER" },
];

const LanguageMultiSelect: React.FC<DropdownProps> = ({ 
  id, 
  name, 
  label = "",
  placeholder = "Select languages",
  value = [],
  onChange
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLDivElement>(null);

  // Initialize options and sync with initial value
  useEffect(() => {
    const initialOptions = languageOptions.map(option => ({ 
      ...option, 
      selected: false 
    }));
    
    // If we have initial values, mark them as selected
    if (value && value.length > 0) {
      const newSelected: number[] = [];
      const newOptions = initialOptions.map((option, index) => {
        const isSelected = value.includes(option.value);
        if (isSelected) {
          newSelected.push(index);
        }
        return { ...option, selected: isSelected };
      });
      setOptions(newOptions);
      setSelected(newSelected);
    } else {
      setOptions(initialOptions);
      setSelected([]);
    }
  }, [value, options]); // Only run once on mount

  // Sync with value prop when it changes
  useEffect(() => {
    if (options.length > 0 && value !== undefined) {
      const newSelected: number[] = [];
      const newOptions = options.map((option, index) => {
        const isSelected = value.includes(option.value);
        if (isSelected) {
          newSelected.push(index);
        }
        return { ...option, selected: isSelected };
      });
      setOptions(newOptions);
      setSelected(newSelected);
    }
  }, [value, options]); // Only depend on value, not options.length

  const open = () => {
    setShow(true);
  };

  const isOpen = () => {
    return show === true;
  };

  const select = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newOptions = [...options];
    const optionIndex = selected.indexOf(index);
    let newSelected: number[];

    if (optionIndex === -1) {
      // Add to selection
      newOptions[index].selected = true;
      newSelected = [...selected, index];
    } else {
      // Remove from selection
      newOptions[index].selected = false;
      newSelected = selected.filter(i => i !== index);
    }

    setOptions(newOptions);
    setSelected(newSelected);

    // Call onChange callback with selected values
    if (onChange) {
      const selectedValues = newSelected.map(idx => newOptions[idx]?.value).filter(Boolean);
      onChange(selectedValues);
    }
  };

  const remove = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newOptions = [...options];
    const selectedIndex = selected.indexOf(index);

    if (selectedIndex !== -1) {
      newOptions[index].selected = false;
      const newSelected = selected.filter(i => i !== index);
      
      setOptions(newOptions);
      setSelected(newSelected);

      // Call onChange callback with selected values
      if (onChange) {
        const selectedValues = newSelected.map(idx => newOptions[idx]?.value).filter(Boolean);
        onChange(selectedValues);
      }
    }
  };

  const selectedValues = () => {
    return selected.map(index => options[index]?.value).filter(Boolean);
  };

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownRef.current || !trigger.current) return;
      if (
        !show ||
        dropdownRef.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setShow(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [show, options]);

  return (
    <div className="relative w-full">
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <div className="relative">
        {/* Hidden input to store selected values for form submission */}
        <input
          type="hidden"
          name={name}
          value={selectedValues().join(',')}
        />

        <div className="flex flex-col items-center">
          <div className="relative z-20 inline-block w-full">
            <div className="relative flex flex-col items-center">
              <div ref={trigger} onClick={open} className="w-full cursor-pointer">
                <div className="mb-2 flex rounded-[7px] border-[1.5px] border-stroke py-[9px] pl-3 pr-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2">
                  <div className="flex flex-auto flex-wrap gap-3">
                    {selected.map((index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center rounded-[5px] border-[.5px] border-stroke bg-gray-2 px-2.5 py-[3px] text-body-sm font-medium dark:border-dark-3 dark:bg-dark"
                      >
                        <div className="max-w-full flex-initial">
                          {options[index]?.text}
                        </div>
                        <div className="flex flex-auto flex-row-reverse">
                          <div
                            onClick={(e) => remove(index, e)}
                            className="cursor-pointer pl-1 hover:text-red"
                          >
                            <svg
                              className="fill-current"
                              role="button"
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.35355 3.35355C9.54882 3.15829 9.54882 2.84171 9.35355 2.64645C9.15829 2.45118 8.84171 2.45118 8.64645 2.64645L6 5.29289L3.35355 2.64645C3.15829 2.45118 2.84171 2.45118 2.64645 2.64645C2.45118 2.84171 2.45118 3.15829 2.64645 3.35355L5.29289 6L2.64645 8.64645C2.45118 8.84171 2.45118 9.15829 2.64645 9.35355C2.84171 9.54882 3.15829 9.54882 3.35355 9.35355L6 6.70711L8.64645 9.35355C8.84171 9.54882 9.15829 9.54882 9.35355 9.35355C9.54882 9.15829 9.54882 8.84171 9.35355 8.64645L6.70711 6L9.35355 3.35355Z"
                                fill=""
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selected.length === 0 && (
                      <div className="flex-1">
                        <input
                          placeholder={placeholder}
                          className="h-full w-full appearance-none bg-transparent p-1 px-2 text-dark-5 outline-none dark:text-dark-6"
                          value=""
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center py-1 pl-1 pr-1">
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.69149 7.09327C3.91613 6.83119 4.31069 6.80084 4.57277 7.02548L9.99936 11.6768L15.4259 7.02548C15.688 6.80084 16.0826 6.83119 16.3072 7.09327C16.5319 7.35535 16.5015 7.74991 16.2394 7.97455L10.4061 12.9745C10.172 13.1752 9.82667 13.1752 9.59261 12.9745L3.75928 7.97455C3.4972 7.74991 3.46685 7.35535 3.69149 7.09327Z"
                        fill=""
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Dropdown Options */}
              <div
                className={`absolute left-0 top-full z-50 w-full overflow-y-auto rounded bg-white shadow-1 dark:bg-dark-2 dark:shadow-card ${
                  isOpen() ? "block" : "hidden"
                }`}
                ref={dropdownRef}
                style={{ maxHeight: '200px' }}
              >
                <div className="flex w-full flex-col">
                  {options.map((option, index) => (
                    <div key={index}>
                      <div
                        className={`w-full cursor-pointer rounded-t border-b border-stroke hover:bg-primary/5 dark:border-dark-3 ${
                          option.selected ? "bg-primary/10" : ""
                        }`}
                        onClick={(event) => select(index, event)}
                      >
                        <div className="relative flex w-full items-center p-2 pl-3">
                          <div className="flex w-full items-center">
                            <div className="leading-6">
                              {option.text}
                            </div>
                          </div>
                          {option.selected && (
                            <div className="text-primary">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageMultiSelect;