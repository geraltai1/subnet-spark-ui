
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface CalculateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const CalculateButton: React.FC<CalculateButtonProps> = ({ onClick, isLoading = false }) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-calculator-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
    >
      <Calculator size={18} />
      {isLoading ? "Calculating..." : "Calculate"}
    </Button>
  );
};

export default CalculateButton;
