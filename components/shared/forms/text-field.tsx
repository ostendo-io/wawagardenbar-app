import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from './form-field-wrapper';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, description, required, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <FormFieldWrapper
        label={label}
        htmlFor={fieldId}
        error={error}
        required={required}
        description={description}
      >
        <Input id={fieldId} ref={ref} {...props} />
      </FormFieldWrapper>
    );
  }
);

TextField.displayName = 'TextField';
