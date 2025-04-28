
import { useState } from "react";

export interface SubnetResult {
  sr: number; // Now starts from 0
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

interface CalculateOptions {
  lanAddress: string;
  subnetCount: string;
  dhcpPool: string;
  dhcpPosition: "start" | "end";
  ppd: string;
  selectedSRs: number[];
}

// IP Utility Functions
function ipToInt(ip: string): number {
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) throw new Error(`Invalid IP format: ${ip}`);
  const octets = ip.split('.');
  if (octets.some(octet => parseInt(octet, 10) > 255)) throw new Error(`Invalid IP octet: ${ip}`);
  return octets.reduce((res, octet) => (res << 8) | parseInt(octet, 10), 0);
}

function intToIp(int: number): string {
  const unsignedInt = int >>> 0;
  return [(unsignedInt >>> 24) & 255, (unsignedInt >>> 16) & 255, 
          (unsignedInt >>> 8) & 255, unsignedInt & 255].join('.');
}

function cidrToMaskInt(cidr: number): number {
  if (isNaN(cidr) || cidr < 0 || cidr > 32) throw new Error(`Invalid CIDR: ${cidr}`);
  if (cidr === 0) return 0;
  return (-1 << (32 - cidr)) >>> 0;
}

function getNetworkAddressInt(ipInt: number, maskInt: number): number {
  return (ipInt & maskInt) >>> 0;
}

function getBroadcastAddressInt(networkInt: number, maskInt: number): number {
  return (networkInt | ~maskInt) >>> 0;
}

function getHostCount(maskInt: number): number {
  let hostBits = 0;
  let tempMask = ~maskInt;
  if (maskInt === 0) hostBits = 32;
  else while (tempMask > 0) { hostBits++; tempMask >>>= 1; }
  const count = BigInt(2) ** BigInt(hostBits);
  return count >= 2 ? Number(count) - 2 : 0;
}

function incrementIpInt(ipInt: number, count = 1): number {
  return (ipInt + Math.max(0, Math.floor(count))) >>> 0;
}

function decrementIpInt(ipInt: number, count = 1): number {
  return (ipInt - Math.max(0, Math.floor(count))) >>> 0;
}

export function useSubnetCalculator() {
  const [results, setResults] = useState<SubnetResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const calculateSubnets = (options: CalculateOptions) => {
    try {
      setError(null);
      
      // Input validation
      const { lanAddress, subnetCount, dhcpPool, dhcpPosition, ppd, selectedSRs } = options;
      
      if (!lanAddress || !lanAddress.includes('/')) {
        throw new Error("Invalid LAN address (CIDR format required).");
      }
      
      const numSubnets = parseInt(subnetCount, 10);
      if (isNaN(numSubnets) || numSubnets < 1) {
        throw new Error("Invalid subnet count.");
      }
      
      const dhcpCount = parseInt(dhcpPool, 10);
      if (isNaN(dhcpCount) || dhcpCount < 0) {
        throw new Error("Invalid DHCP count.");
      }
      
      const ppdAddressIndex = parseInt(ppd, 10);
      if (isNaN(ppdAddressIndex) || ppdAddressIndex < 0) {
        throw new Error("Invalid PPD index.");
      }

      // Initial calculations
      const [lanIpStr, initialCidrStr] = lanAddress.split('/');
      const initialCidr = parseInt(initialCidrStr, 10);
      const lanIpInt = ipToInt(lanIpStr);
      
      if (isNaN(initialCidr) || initialCidr < 0 || initialCidr > 32) {
        throw new Error("Invalid initial CIDR.");
      }

      const subnetBitsNeeded = Math.ceil(Math.log2(numSubnets));
      const newCidr = initialCidr + subnetBitsNeeded;
      
      if (newCidr > 30) {
        throw new Error(`Cannot create ${numSubnets} subnets (/${newCidr}). Max mask /30.`);
      }
      
      if (newCidr > 32) {
        throw new Error(`New CIDR (/${newCidr}) is invalid.`);
      }

      const newMaskInt = cidrToMaskInt(newCidr);
      const initialNetworkBlockInt = getNetworkAddressInt(lanIpInt, cidrToMaskInt(initialCidr));
      
      // If provided IP isn't the network address, log a warning and use the correct network address
      if (lanIpInt !== initialNetworkBlockInt) {
        console.warn("Provided LAN address is not the network address. Using:", intToIp(initialNetworkBlockInt));
      }
      
      const subnetSize = Math.pow(2, 32 - newCidr);
      if (subnetSize === 0 && newCidr !== 32) {
        throw new Error("Error calculating subnet size.");
      }

      // Calculate all subnets
      const calculatedResults: SubnetResult[] = [];
      let currentNetworkInt = initialNetworkBlockInt;

      for (let i = 0; i < numSubnets; i++) {
        // Key addresses
        const networkAddrInt = currentNetworkInt;
        const broadcastAddrInt = getBroadcastAddressInt(networkAddrInt, newMaskInt);
        const firstUsableInt = incrementIpInt(networkAddrInt);
        const lastUsableInt = decrementIpInt(broadcastAddrInt);
        const totalUsableHosts = getHostCount(newMaskInt);

        const result: SubnetResult = {
          sr: i, // Starting from 0 as requested
          networkAddress: `${intToIp(networkAddrInt)}/${newCidr}`,
          broadcastAddress: intToIp(broadcastAddrInt),
          validRange: `${intToIp(firstUsableInt)} - ${intToIp(lastUsableInt)}`,
          ppdAddress: "N/A",
          dhcpRange: "N/A",
          staticPool: "N/A",
          intermediateDevices: "N/A",
          servers: "N/A",
          printers: "N/A",
          others: "N/A",
          errors: []
        };

        // Handle no usable hosts case
        if (totalUsableHosts <= 0 || firstUsableInt > lastUsableInt) {
          result.errors?.push("No usable IP addresses in this subnet");
          calculatedResults.push(result);
          
          const nextNetwork = incrementIpInt(currentNetworkInt, subnetSize);
          if (nextNetwork <= currentNetworkInt && i < numSubnets - 1) {
            throw new Error("Critical error: Subnet loop detected");
          }
          currentNetworkInt = nextNetwork;
          continue;
        }

        // --- Allocation Logic (PPD, DHCP, Static Ranges) ---
        const allocationNotes: string[] = [];

        // 1. Identify PPD Address
        let ppdAddrInt: number | null = null;
        let isPpdValid = false;
        
        if (ppdAddressIndex > 0 && ppdAddressIndex <= totalUsableHosts) {
          ppdAddrInt = incrementIpInt(networkAddrInt, ppdAddressIndex);
          result.ppdAddress = intToIp(ppdAddrInt);
          isPpdValid = true;
        } else if (ppdAddressIndex > 0) {
          allocationNotes.push(`PPD index (${ppdAddressIndex}) out of range (1-${totalUsableHosts})`);
          result.ppdAddress = "Invalid";
        }

        // 2. Calculate DHCP Range (Excluding PPD)
        let dhcpStartInt = -1;
        let dhcpEndInt = -1;
        let potentialDhcpPool: number[] = []; // Usable IPs MINUS valid PPD

        // Build potential DHCP pool
        let tempIpInt = firstUsableInt;
        while (tempIpInt <= lastUsableInt) {
          if (!isPpdValid || tempIpInt !== ppdAddrInt) { // Exclude PPD if valid
            potentialDhcpPool.push(tempIpInt);
          }
          const nextTempIpInt = incrementIpInt(tempIpInt);
          if (nextTempIpInt <= tempIpInt) break;
          tempIpInt = nextTempIpInt;
        }

        // Allocate DHCP from potential pool
        if (potentialDhcpPool.length >= dhcpCount && dhcpCount > 0) {
          if (dhcpPosition === 'end') {
            const startIndex = potentialDhcpPool.length - dhcpCount;
            dhcpStartInt = potentialDhcpPool[startIndex];
            dhcpEndInt = potentialDhcpPool[potentialDhcpPool.length - 1];
          } else { // 'start'
            dhcpStartInt = potentialDhcpPool[0];
            dhcpEndInt = potentialDhcpPool[dhcpCount - 1];
          }
          result.dhcpRange = `${intToIp(dhcpStartInt)} - ${intToIp(dhcpEndInt)}`;
        } else if (dhcpCount > 0) {
          allocationNotes.push(`Insufficient space for ${dhcpCount} DHCP addresses (${potentialDhcpPool.length} available excluding PPD)`);
          result.dhcpRange = "Insufficient";
        }

        // 3. Determine Total Static Pool (Usable IPs - DHCP)
        let staticPoolInts: number[] = [];

        tempIpInt = firstUsableInt;
        while (tempIpInt <= lastUsableInt) {
          const isDhcp = (dhcpStartInt !== -1 && tempIpInt >= dhcpStartInt && tempIpInt <= dhcpEndInt);
          if (!isDhcp) {
            staticPoolInts.push(tempIpInt); // Includes PPD if not in DHCP range
          }
          const nextTempIpInt = incrementIpInt(tempIpInt);
          if (nextTempIpInt <= tempIpInt) break;
          tempIpInt = nextTempIpInt;
        }

        const totalStaticPoolSize = staticPoolInts.length;
        if (totalStaticPoolSize > 0) {
          const staticPoolStartIp = intToIp(staticPoolInts[0]);
          const staticPoolEndIp = intToIp(staticPoolInts[totalStaticPoolSize - 1]);
          result.staticPool = `${staticPoolStartIp} ... ${staticPoolEndIp} (${totalStaticPoolSize} addresses)`;
        } else {
          allocationNotes.push("No addresses remaining for static pool after DHCP allocation");
        }

        // 4. Equal Distribution of Static Pool
        const staticRanges = { interm: null, servers: null, printers: null, others: null };
        const numStaticCategories = 4;
        const categoryOrder = ['interm', 'servers', 'printers', 'others'];
        let staticSizes = { interm: 0, servers: 0, printers: 0, others: 0 };

        if (totalStaticPoolSize > 0) {
          if (totalStaticPoolSize < numStaticCategories) {
            allocationNotes.push(`Static pool (${totalStaticPoolSize}) insufficient for 1/category`);
            for (let k = 0; k < totalStaticPoolSize; k++) {
              staticSizes[categoryOrder[k] as keyof typeof staticSizes] = 1;
            }
          } else {
            const baseStaticSize = Math.floor(totalStaticPoolSize / numStaticCategories);
            const remainderStatic = totalStaticPoolSize % numStaticCategories;
            staticSizes = {
              interm: baseStaticSize,
              servers: baseStaticSize,
              printers: baseStaticSize,
              others: baseStaticSize + remainderStatic
            };
          }
        }

        // 5. Sequential Allocation WITHIN Static Pool
        let currentStaticPoolIndex = 0;
        for (const category of categoryOrder) {
          const sizeToAllocate = staticSizes[category as keyof typeof staticSizes];
          if (sizeToAllocate === 0 || currentStaticPoolIndex >= totalStaticPoolSize) {
            continue;
          }

          const startIndex = currentStaticPoolIndex;
          const endIndex = Math.min(currentStaticPoolIndex + sizeToAllocate - 1, totalStaticPoolSize - 1);
          const allocatedCount = (endIndex - startIndex) + 1;

          if (allocatedCount > 0) {
            const startRangeInt = staticPoolInts[startIndex];
            const endRangeInt = staticPoolInts[endIndex];
            
            // Check if PPD is in this specific range
            const ppdInRange = (ppdAddrInt !== null && 
                              ppdAddrInt >= startRangeInt && 
                              ppdAddrInt <= endRangeInt);
            
            let rangeStr = `${intToIp(startRangeInt)} - ${intToIp(endRangeInt)}`;
            
            // Highlight if PPD is in this range
            if (ppdInRange) {
              if (startRangeInt === endRangeInt && startRangeInt === ppdAddrInt) {
                rangeStr = `${intToIp(startRangeInt)} (PPD)`;
              } else {
                rangeStr += ' (incl. PPD)';
              }
            }
            
            // Assign to the appropriate category in the result
            if (category === 'interm') result.intermediateDevices = rangeStr;
            else if (category === 'servers') result.servers = rangeStr;
            else if (category === 'printers') result.printers = rangeStr;
            else if (category === 'others') result.others = rangeStr;

            if (allocatedCount < sizeToAllocate) {
              allocationNotes.push(`Partial static allocation for ${category} (${allocatedCount}/${sizeToAllocate})`);
            }
            currentStaticPoolIndex += allocatedCount;
          } else {
            allocationNotes.push(`Static allocation error for ${category}`);
          }
        }

        if (allocationNotes.length > 0) {
          result.errors = allocationNotes;
        }

        calculatedResults.push(result);

        // Move to next network
        const nextNetwork = incrementIpInt(currentNetworkInt, subnetSize);
        if (nextNetwork <= currentNetworkInt && i < numSubnets - 1) {
          throw new Error("Critical error: Subnet loop detected");
        }
        currentNetworkInt = nextNetwork;
      }
      
      // Filter results based on selected SRs if any are specified
      const filteredResults = selectedSRs.length > 0 
          ? calculatedResults.filter(result => selectedSRs.includes(result.sr))
          : calculatedResults;
          
      setResults(filteredResults);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
      setResults([]);
    }
  };

  return {
    calculateSubnets,
    results,
    error
  };
}
