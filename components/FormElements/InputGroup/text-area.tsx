import { cn } from "@/lib/utils";
import { useId } from "react";

interface PropsType {
  label: string;
  placeholder: string;
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  icon?: React.ReactNode;
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  readOnly?: boolean;
  autoFocus?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export function TextAreaGroup({
  label,
  placeholder,
  name,
  value,
  required,
  disabled,
  active,
  className,
  icon,
  defaultValue,
  rows = 6,
  maxLength,
  minLength,
  readOnly,
  autoFocus,
  onChange,
  onFocus,
  onBlur,
}: PropsType) {
  const id = useId();

  return (
    <div className={cn(className)}>
      <label
        htmlFor={id}
        className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative mt-3 [&_svg]:pointer-events-none [&_svg]:absolute [&_svg]:left-5.5 [&_svg]:top-5.5">
        <textarea
          id={id}
          name={name}
          value={value}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue}
          maxLength={maxLength}
          minLength={minLength}
          readOnly={readOnly}
          autoFocus={autoFocus}
          className={cn(
            "w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary",
            icon && "py-5 pl-13 pr-5",
          )}
          required={required}
          disabled={disabled}
          data-active={active}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        {icon}

        {/* Character count display */}
        {maxLength && value && (
          <div className="absolute bottom-2 right-2 text-xs text-dark-5 dark:text-dark-6">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}