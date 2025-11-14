import { forwardRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormFieldWrapper } from './form-field-wrapper';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  description?: string;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  (
    {
      label,
      options,
      placeholder = 'Select an option',
      error,
      description,
      required,
      value,
      onValueChange,
      disabled,
    },
    ref
  ) => {
    const fieldId = label.toLowerCase().replace(/\s+/g, '-');

    return (
      <FormFieldWrapper
        label={label}
        htmlFor={fieldId}
        error={error}
        required={required}
        description={description}
      >
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger ref={ref} id={fieldId}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>
    );
  }
);

SelectField.displayName = 'SelectField';
