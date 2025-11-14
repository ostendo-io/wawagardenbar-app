import { forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldWrapper } from './form-field-wrapper';

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  description?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
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
        <Textarea id={fieldId} ref={ref} {...props} />
      </FormFieldWrapper>
    );
  }
);

TextareaField.displayName = 'TextareaField';
