
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, "-")} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <UISelect value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border border-calculator-border rounded-lg focus:ring-calculator-primary focus:border-calculator-primary bg-white">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-calculator-border rounded-lg shadow-lg">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-calculator-secondary">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </UISelect>
    </div>
  );
};

export default Select;
