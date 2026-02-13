// src/components/FormElements/select/index.tsx
"use client";

import React, { useId, useRef, useState } from "react";
import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";

type ItemType = { value: string; label: string };
type PropsType = {
  label: string;
  items: ItemType[];
  prefixIcon?: React.ReactNode;
  className?: string;
  name?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean; // Added disabled field
} & (
  | { placeholder?: string; defaultValue: string }
  | { placeholder?: string; defaultValue?: string }
);

export function Select({
  items,
  label,
  defaultValue,
  placeholder,
  prefixIcon,
  className,
  searchable = false,
  name,
  required,
  value,
  onChange,
  disabled = false, // Default to false
}: PropsType & { searchable?: boolean }) {
  const id = useId();
  const [selected, setSelected] = useState(
    items.find((item) => item.value === (value || defaultValue)) || null
  );
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      const newSelected = items.find((item) => item.value === value) || null;
      setSelected(newSelected);
    }
  }, [value, items]);

  // Filter items if searchable
  const filteredItems = searchable
    ? items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!searchable || !open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, searchable]);

  const handleSelectChange = (newValue: string) => {
    if (!disabled) {
      if (onChange) {
        onChange(newValue);
      } else {
        const newSelected = items.find((item) => item.value === newValue) || null;
        setSelected(newSelected);
      }
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleItemSelect = (itemValue: string) => {
    if (!disabled) {
      handleSelectChange(itemValue);
      setSearch("");
      setOpen(false);
    }
  };

  if (!searchable) {
    // Native select for non-searchable
    return (
      <div className={cn("space-y-3", className, disabled && "opacity-60")}>
        <label
          htmlFor={id}
          className={cn(
            "block text-body-sm font-medium text-dark dark:text-white",
            disabled && "cursor-not-allowed"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {prefixIcon}
            </div>
          )}
          <select
            id={id}
            name={name}
            required={required}
            value={value !== undefined ? value : defaultValue || ""}
            onChange={(e) => handleSelectChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6",
              prefixIcon && "pl-11.5",
              disabled && "cursor-not-allowed bg-gray-2 dark:bg-dark-3"
            )}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {items.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronUpIcon className={cn(
            "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-180",
            disabled && "opacity-50"
          )} />
        </div>
      </div>
    );
  }

  // Custom dropdown for searchable
  return (
    <div className={cn("space-y-3", className, disabled && "opacity-60")} ref={containerRef}>
      <label
        htmlFor={id}
        className={cn(
          "block text-body-sm font-medium text-dark dark:text-white",
          disabled && "cursor-not-allowed"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {prefixIcon}
          </div>
        )}
        <input
          id={id}
          name={name}
          required={required}
          type="text"
          value={open ? search : selected?.label || ""}
          onChange={(e) => {
            if (!disabled) {
              setSearch(e.target.value);
              setOpen(true);
            }
          }}
          onFocus={handleInputFocus}
          placeholder={placeholder || "Search..."}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary",
            prefixIcon && "pl-11.5",
            disabled && "cursor-not-allowed bg-gray-2 dark:bg-dark-3"
          )}
          autoComplete="off"
        />
        <ChevronUpIcon
          className={cn(
            "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition",
            open ? "rotate-180" : "",
            disabled && "opacity-50"
          )}
        />
        {open && !disabled && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-stroke bg-white dark:bg-dark-2 shadow-lg max-h-60 overflow-auto">
            {filteredItems.length === 0 && (
              <li className="px-5.5 py-2 text-dark-5 dark:text-dark-6">
                No options
              </li>
            )}
            {filteredItems.map((item) => (
              <li
                key={item.value}
                className={cn(
                  "cursor-pointer px-5.5 py-2 hover:bg-primary/10 text-dark dark:text-white",
                  selected?.value === item.value && "bg-primary/20",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                onMouseDown={() => handleItemSelect(item.value)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}