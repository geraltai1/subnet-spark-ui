
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const ResultsTable = () => {
  // This is just a placeholder table
  const headers = ["Subnet", "Network Address", "Broadcast", "Usable IPs", "Mask", "DHCP Range"];
  
  // Create empty rows for the placeholder
  const emptyRows = Array(4).fill(null).map((_, index) => ({
    id: index,
    subnet: `Subnet ${index + 1}`,
    network: "-",
    broadcast: "-",
    usableIps: "-",
    mask: "-",
    dhcpRange: "-",
  }));

  return (
    <Card className="overflow-hidden border border-calculator-border rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-calculator-secondary">
              {headers.map((header, index) => (
                <TableHead key={index} className="text-gray-700 font-medium py-3">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {emptyRows.map((row) => (
              <TableRow key={row.id} className="border-t border-calculator-border hover:bg-gray-50">
                <TableCell className="font-medium">{row.subnet}</TableCell>
                <TableCell>{row.network}</TableCell>
                <TableCell>{row.broadcast}</TableCell>
                <TableCell>{row.usableIps}</TableCell>
                <TableCell>{row.mask}</TableCell>
                <TableCell>{row.dhcpRange}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ResultsTable;
