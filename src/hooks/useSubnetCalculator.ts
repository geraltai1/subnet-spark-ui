
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
