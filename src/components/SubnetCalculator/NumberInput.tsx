
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  placeholder = "Enter a number",
  value,
  onChange,
  min,
  max,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, "-")} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={label.toLowerCase().replace(/\s/g, "-")}
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className="pl-3 pr-3 py-2 border border-calculator-border rounded-lg focus:ring-calculator-primary focus:border-calculator-primary"
      />
    </div>
  );
};

export default NumberInput;
