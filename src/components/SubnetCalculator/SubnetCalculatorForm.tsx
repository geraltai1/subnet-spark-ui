
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import IpAddressInput from "./IpAddressInput";
import NumberInput from "./NumberInput";
import Select from "./Select";
import CalculateButton from "./CalculateButton";
import { ipToInt, cidrToMaskInt, getNetworkAddressInt } from "@/lib/ipUtils";

const SubnetCalculatorForm = () => {
  const [lanAddress, setLanAddress] = useState("");
  const [subnetCount, setSubnetCount] = useState("");
  const [dhcpPool, setDhcpPool] = useState("");
  const [dhcpPosition, setDhcpPosition] = useState("start");
  const [ppd, setPpd] = useState("");

  const handleCalculate = () => {
    try {
      // Basic validation
      if (!lanAddress || !lanAddress.includes('/')) {
        console.error("Invalid LAN address (CIDR format required)");
        return;
      }

      const [lanIpStr, initialCidrStr] = lanAddress.split('/');
      const initialCidr = parseInt(initialCidrStr, 10);
      const lanIpInt = ipToInt(lanIpStr);
      
      if (isNaN(initialCidr) || initialCidr < 0 || initialCidr > 32) {
        console.error("Invalid initial CIDR");
        return;
      }

      // Calculate subnet bits needed
      const numSubnetsVal = parseInt(subnetCount, 10);
      const subnetBitsNeeded = Math.ceil(Math.log2(numSubnetsVal));
      const newCidr = initialCidr + subnetBitsNeeded;

      if (newCidr > 30) {
        console.error(`Cannot create ${numSubnetsVal} subnets (/${newCidr}). Max mask /30.`);
        return;
      }

      const initialNetworkBlockInt = getNetworkAddressInt(lanIpInt, cidrToMaskInt(initialCidr));
      
      console.log("Calculating with values:", {
        lanAddress,
        subnetCount,
        dhcpPool,
        dhcpPosition,
        ppd,
        initialNetworkBlockInt
      });
      
      // This will be expanded with the full calculation logic in the next iteration
    } catch (error) {
      console.error("Calculation error:", error);
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
