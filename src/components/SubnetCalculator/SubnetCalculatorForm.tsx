
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import IpAddressInput from "./IpAddressInput";
import NumberInput from "./NumberInput";
import Select from "./Select";
import CalculateButton from "./CalculateButton";
import { useSubnetCalculator } from "@/hooks/useSubnetCalculator";

interface SubnetCalculatorFormProps {
  onCalculate: (results: any[]) => void;
}

const SubnetCalculatorForm = ({ onCalculate }: SubnetCalculatorFormProps) => {
  const [lanAddress, setLanAddress] = useState("");
  const [subnetCount, setSubnetCount] = useState("");
  const [dhcpPool, setDhcpPool] = useState("");
  const [dhcpPosition, setDhcpPosition] = useState<"start" | "end">("start");
  const [ppd, setPpd] = useState("");
  const [selectedSRs, setSelectedSRs] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);

  const { toast } = useToast();
  const { calculateSubnets, results, error } = useSubnetCalculator();

  const handleCalculate = () => {
    setIsCalculating(true);
    try {
      const srArray = selectedSRs
        ? selectedSRs.split(',')
            .map(sr => sr.trim())
            .filter(sr => /^\d+$/.test(sr))
            .map(Number)
        : [];

      calculateSubnets({
        lanAddress,
        subnetCount,
        dhcpPool,
        dhcpPosition,
        ppd,
        selectedSRs: srArray
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error
        });
      } else {
        onCalculate(results);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Calculation error"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const dhcpOptions = [
    { value: "start", label: "Beginning of Range" },
    { value: "end", label: "End of Range" },
  ];

  return (
    <Card className="border border-calculator-border rounded-xl shadow-md bg-white">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <IpAddressInput
              label="LAN Address"
              placeholder="192.168.1.0/24"
              value={lanAddress}
              onChange={setLanAddress}
            />
          </div>
          
          <NumberInput
            label="Number of Subnetworks"
            placeholder="4"
            value={subnetCount}
            onChange={setSubnetCount}
            min={1}
          />
          
          <NumberInput
            label="DHCP Pool"
            placeholder="4"
            value={dhcpPool}
            onChange={setDhcpPool}
            min={0}
          />
          
          <Select
            label="DHCP Position"
            options={dhcpOptions}
            value={dhcpPosition}
            onChange={(value) => setDhcpPosition(value as "start" | "end")}
          />
          
          <NumberInput
            label="PPD (Point-to-point /30s)"
            placeholder="1"
            value={ppd}
            onChange={setPpd}
            min={0}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SRs to Display (comma-separated, e.g., "0,1,2")
            </label>
            <input
              type="text"
              value={selectedSRs}
              onChange={(e) => setSelectedSRs(e.target.value)}
              placeholder="Leave empty to show all"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-calculator-primary"
            />
          </div>
          
          <div className="md:col-span-2 mt-4">
            <CalculateButton onClick={handleCalculate} isLoading={isCalculating} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubnetCalculatorForm;
