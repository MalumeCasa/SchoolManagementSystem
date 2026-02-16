import { CheckIcon, XIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useId } from "react";

type PropsType = {
  withIcon?: "check" | "x";
  withBg?: boolean;
  id?: string;
  label: string;
  name?: string;
  value?: string;
  minimal?: boolean;
  checked?: boolean; // Added checked prop
  defaultChecked?: boolean; // Optional: for uncontrolled usage
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  radius?: "default" | "md";
  required?: boolean;
  className?: string;
};

export function Checkbox({
  withIcon,
  label,
  name,
  value,
  withBg,
  minimal,
  checked, // Added to destructuring
  defaultChecked, // Added to destructuring
  onChange,
  radius,
  required,
  className,
}: PropsType) {
  const id = useId();

  return (
    <div className={cn("flex", className)}>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer select-none items-center",
          !minimal && "text-body-sm font-medium",
        )}
      >
        <div className="relative">
          <input
            type="checkbox"
            onChange={onChange}
            name={name}
            value={value}
            id={id}
            checked={checked} // Added checked attribute
            defaultChecked={defaultChecked} // Added defaultChecked attribute
            required={required}
            className="peer sr-only"
          />

          <div
            className={cn(
              "mr-2 flex size-5 items-center justify-center rounded border border-dark-5 peer-checked:border-primary dark:border-dark-6 peer-checked:[&>*]:block",
              withBg
                ? "peer-checked:bg-primary [&>*]:text-white"
                : "peer-checked:bg-gray-2 dark:peer-checked:bg-transparent",
              minimal && "mr-3 border-stroke dark:border-dark-3",
              radius === "md" && "rounded-md",
            )}
          >
            {!withIcon && (
              <span className="hidden size-2.5 rounded-sm bg-primary" />
            )}

            {withIcon === "check" && (
              <CheckIcon className="hidden text-primary" />
            )}

            {withIcon === "x" && <XIcon className="hidden text-primary" />}
          </div>
        </div>
        <span>{label}</span>
      </label>
    </div>
  );
}