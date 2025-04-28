
import { useState } from 'react';
import { ipToInt, intToIp, cidrToMaskInt, getNetworkAddressInt, getBroadcastAddressInt, incrementIpInt, decrementIpInt, getHostCount } from '@/lib/ipUtils';

interface SubnetFormData {
  lanAddress: string;
  subnetCount: string;
  dhcpPool: string;
  dhcpPosition: 'start' | 'end';
  ppd: string;
}

export interface SubnetResult {
  sr: number;
  networkAddress: string;
  validRange: string;
  ppdAddress: string;
  dhcpRange: string;
  staticPool: string;
  intermediateDevices: string;
  servers: string;
  printers: string;
  others: string;
  broadcastAddress: string;
  errors?: string[];
}

export function useSubnetCalculator() {
  const [results, setResults] = useState<SubnetResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const calculateSubnets = (data: SubnetFormData) => {
    try {
      // Clear previous results and errors
      setError(null);

      // Basic validation
      if (!data.lanAddress || !data.lanAddress.includes('/')) {
        throw new Error("Invalid LAN address (CIDR format required)");
      }

      const [lanIpStr, initialCidrStr] = data.lanAddress.split('/');
      const initialCidr = parseInt(initialCidrStr, 10);
      const lanIpInt = ipToInt(lanIpStr);
      const numSubnets = parseInt(data.subnetCount, 10);
      const dhcpCount = parseInt(data.dhcpPool, 10);
      const ppdAddressIndex = parseInt(data.ppd, 10);

      // Validate inputs
      if (isNaN(initialCidr) || initialCidr < 0 || initialCidr > 32) {
        throw new Error("Invalid initial CIDR");
      }
      if (isNaN(numSubnets) || numSubnets < 1) {
        throw new Error("Invalid number of subnets");
      }
      if (isNaN(dhcpCount) || dhcpCount < 1) {
        throw new Error("Invalid DHCP pool size");
      }
      if (isNaN(ppdAddressIndex) || ppdAddressIndex < 1) {
        throw new Error("Invalid PPD index");
      }

      // Calculate subnet bits needed
      const subnetBitsNeeded = Math.ceil(Math.log2(numSubnets));
      const newCidr = initialCidr + subnetBitsNeeded;

      if (newCidr > 30) {
        throw new Error(`Cannot create ${numSubnets} subnets (/${newCidr}). Max mask /30.`);
      }

      const newMaskInt = cidrToMaskInt(newCidr);
      const initialNetworkBlockInt = getNetworkAddressInt(lanIpInt, cidrToMaskInt(initialCidr));
      const subnetSize = Math.pow(2, 32 - newCidr);

      const calculatedResults: SubnetResult[] = [];

      let currentNetworkInt = initialNetworkBlockInt;

      for (let i = 0; i < numSubnets; i++) {
        const networkAddrInt = currentNetworkInt;
        const broadcastAddrInt = getBroadcastAddressInt(networkAddrInt, newMaskInt);
        const firstUsableInt = incrementIpInt(networkAddrInt);
        const lastUsableInt = decrementIpInt(broadcastAddrInt);
        const totalUsableHosts = getHostCount(newMaskInt);

        const subnetResult: SubnetResult = {
          sr: i + 1,
          networkAddress: `${intToIp(networkAddrInt)}/${newCidr}`,
          validRange: `${intToIp(firstUsableInt)} - ${intToIp(lastUsableInt)}`,
          ppdAddress: '-',
          dhcpRange: '-',
          staticPool: '-',
          intermediateDevices: '-',
          servers: '-',
          printers: '-',
          others: '-',
          broadcastAddress: intToIp(broadcastAddrInt),
          errors: []
        };

        if (totalUsableHosts > 0 && firstUsableInt <= lastUsableInt) {
          // Calculate PPD address
          if (ppdAddressIndex <= totalUsableHosts) {
            const ppdAddrInt = incrementIpInt(networkAddrInt, ppdAddressIndex);
            subnetResult.ppdAddress = intToIp(ppdAddrInt);

            // Calculate DHCP range (excluding PPD)
            const usableIps = [];
            let tempIp = firstUsableInt;
            while (tempIp <= lastUsableInt) {
              if (tempIp !== ppdAddrInt) {
                usableIps.push(tempIp);
              }
              tempIp = incrementIpInt(tempIp);
            }

            if (usableIps.length >= dhcpCount) {
              const dhcpStart = data.dhcpPosition === 'end' 
                ? usableIps[usableIps.length - dhcpCount] 
                : usableIps[0];
              const dhcpEnd = data.dhcpPosition === 'end' 
                ? usableIps[usableIps.length - 1] 
                : usableIps[dhcpCount - 1];
              subnetResult.dhcpRange = `${intToIp(dhcpStart)} - ${intToIp(dhcpEnd)}`;

              // Calculate static ranges (excluding DHCP and PPD)
              const staticIps = usableIps.filter(ip => 
                (data.dhcpPosition === 'end' && ip < dhcpStart) ||
                (data.dhcpPosition === 'start' && ip > dhcpEnd)
              );

              if (staticIps.length > 0) {
                const staticPoolSize = staticIps.length;
                const baseSize = Math.floor(staticPoolSize / 4);
                const extraAddresses = staticPoolSize % 4;

                let currentIndex = 0;
                
                // Distribute static IPs among categories
                const assignRange = (count: number) => {
                  if (count === 0 || currentIndex >= staticIps.length) return '-';
                  const start = staticIps[currentIndex];
                  const end = staticIps[currentIndex + count - 1];
                  currentIndex += count;
                  return `${intToIp(start)} - ${intToIp(end)}`;
                };

                subnetResult.intermediateDevices = assignRange(baseSize);
                subnetResult.servers = assignRange(baseSize);
                subnetResult.printers = assignRange(baseSize);
                subnetResult.others = assignRange(baseSize + extraAddresses);

                subnetResult.staticPool = `${intToIp(staticIps[0])} - ${intToIp(staticIps[staticIps.length - 1])}`;
              }
            } else {
              subnetResult.errors?.push(`Insufficient space for ${dhcpCount} DHCP addresses`);
            }
          } else {
            subnetResult.errors?.push(`PPD index ${ppdAddressIndex} exceeds available hosts`);
          }
        }

        calculatedResults.push(subnetResult);
        currentNetworkInt = incrementIpInt(currentNetworkInt, subnetSize);
      }

      setResults(calculatedResults);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Calculation error");
      setResults([]);
    }
  };

  return {
    results,
    error,
    calculateSubnets
  };
}
