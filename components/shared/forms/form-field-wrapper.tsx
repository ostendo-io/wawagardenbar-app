import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}

export function FormFieldWrapper({
  label,
  htmlFor,
  error,
  required,
  description,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
