
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import IpAddressInput from "./IpAddressInput";
import NumberInput from "./NumberInput";
import Select from "./Select";
import CalculateButton from "./CalculateButton";

const SubnetCalculatorForm = () => {
  const [lanAddress, setLanAddress] = useState("");
  const [subnetCount, setSubnetCount] = useState("");
  const [dhcpPool, setDhcpPool] = useState("");
  const [dhcpPosition, setDhcpPosition] = useState("start");
  const [ppd, setPpd] = useState("");

  const handleCalculate = () => {
    console.log("Calculating with values:", {
      lanAddress,
      subnetCount,
      dhcpPool,
      dhcpPosition,
      ppd,
    });
    // This would be where the actual calculation logic would go
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
            onChange={setDhcpPosition}
          />
          
          <NumberInput
            label="PPD (Point-to-point /30s)"
            placeholder="1"
            value={ppd}
            onChange={setPpd}
            min={0}
          />
          
          <div className="md:col-span-2 mt-4">
            <CalculateButton onClick={handleCalculate} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubnetCalculatorForm;
