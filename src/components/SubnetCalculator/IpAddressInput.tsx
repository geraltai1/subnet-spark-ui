
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IpAddressInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const IpAddressInput: React.FC<IpAddressInputProps> = ({
  label,
  placeholder = "192.168.1.0/24",
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="ip-address" className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id="ip-address"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-3 pr-3 py-2 border border-calculator-border rounded-lg focus:ring-calculator-primary focus:border-calculator-primary"
        />
      </div>
    </div>
  );
};

export default IpAddressInput;
