"use client";

import { useMemo } from "react";
import type { MultiValue, SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

type SelectProps = {
  onChange: (value?: string | string[]) => void;
  onCreate?: (value: string) => void;
  options?: { label: string; value: string }[];
  value?: string | string[] | null | undefined;
  disabled?: boolean;
  placeholder?: string;
  isMulti?: boolean;
};

export const Select = ({
  value,
  onChange,
  onCreate,
  options = [],
  disabled,
  placeholder,
  isMulti = false,
}: SelectProps) => {
  const onSelect = (
    option: MultiValue<{ label: string; value: string }> | SingleValue<{ label: string; value: string }>
  ) => {
    if (isMulti) {
      const multiOption = option as MultiValue<{ label: string; value: string }>;
      onChange(multiOption.map((opt) => opt.value));
    } else {
      const singleOption = option as SingleValue<{ label: string; value: string }>;
      onChange(singleOption?.value);
    }
  };

  const formattedValue = useMemo(() => {
    if (isMulti && Array.isArray(value)) {
      return options.filter((option) => value.includes(option.value));
    }
    return options.find((option) => option.value === value);
  }, [options, value, isMulti]);

  return (
    <CreatableSelect
      placeholder={placeholder}
      className="h-10 text-sm"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#e2e8f0",
          ":hover": {
            borderColor: "#e2e8f0",
          },
        }),
      }}
      value={formattedValue}
      onChange={onSelect}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
      isMulti={isMulti}
    />
  );
};