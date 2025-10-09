import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  id?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  id,
  ...props
}) => (
  <div className="space-y-2">
    {label && (
      <Label htmlFor={id} className="text-form-label">
        {label}
        {required ? " *" : ""}
      </Label>
    )}
    <Input id={id} required={required} {...props} />
  </div>
);