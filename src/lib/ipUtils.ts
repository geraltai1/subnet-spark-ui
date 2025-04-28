
export function ipToInt(ip: string): number {
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) throw new Error(`Invalid IP format: ${ip}`);
  const octets = ip.split('.');
  if (octets.some(octet => parseInt(octet, 10) > 255)) throw new Error(`Invalid IP octet: ${ip}`);
  return octets.reduce((res, octet) => (res << 8) | parseInt(octet, 10), 0);
}

export function intToIp(int: number): string {
  const unsignedInt = int >>> 0;
  return [(unsignedInt >>> 24) & 255, (unsignedInt >>> 16) & 255, (unsignedInt >>> 8) & 255, unsignedInt & 255].join('.');
}

export function cidrToMaskInt(cidr: number): number {
  if (isNaN(cidr) || cidr < 0 || cidr > 32) throw new Error(`Invalid CIDR: ${cidr}`);
  if (cidr === 0) return 0;
  return (-1 << (32 - cidr)) >>> 0;
}

export function getNetworkAddressInt(ipInt: number, maskInt: number): number {
  return (ipInt & maskInt) >>> 0;
}

export function getBroadcastAddressInt(networkInt: number, maskInt: number): number {
  return (networkInt | ~maskInt) >>> 0;
}

export function getHostCount(maskInt: number): number {
  let hostBits = 0;
  let tempMask = ~maskInt;
  if (maskInt === 0) hostBits = 32;
  else while (tempMask > 0) { hostBits++; tempMask >>>= 1; }
  const count = BigInt(2) ** BigInt(hostBits);
  return count >= 2 ? Number(count) - 2 : 0;
}

export function incrementIpInt(ipInt: number, count = 1): number {
  return (ipInt + Math.max(0, Math.floor(count))) >>> 0;
}

export function decrementIpInt(ipInt: number, count = 1): number {
  return (ipInt - Math.max(0, Math.floor(count))) >>> 0;
}
