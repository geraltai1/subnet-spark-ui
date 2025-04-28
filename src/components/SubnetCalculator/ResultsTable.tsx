
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { SubnetResult } from "@/hooks/useSubnetCalculator";

interface ResultsTableProps {
  results: SubnetResult[];
}

const ResultsTable = ({ results }: ResultsTableProps) => {
  return (
    <Card className="overflow-hidden border border-calculator-border rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-calculator-secondary">
              <TableHead className="text-center">SR</TableHead>
              <TableHead>Adresse Réseau</TableHead>
              <TableHead>Plage Valide</TableHead>
              <TableHead>Adresse PPD</TableHead>
              <TableHead>Plage DHCP</TableHead>
              <TableHead>Pool Statique Total</TableHead>
              <TableHead>Périph. Interm.</TableHead>
              <TableHead>Serveurs</TableHead>
              <TableHead>Imprimantes</TableHead>
              <TableHead>Autres</TableHead>
              <TableHead>Adresse Diffusion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length > 0 ? (
              results.map((result, index) => (
                <TableRow key={index} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                  <TableCell className="text-center">
                    {result.sr}
                    {result.errors && result.errors.length > 0 && (
                      <span className="text-red-500 ml-1" title={result.errors.join(', ')}>*</span>
                    )}
                  </TableCell>
                  <TableCell>{result.networkAddress}</TableCell>
                  <TableCell>{result.validRange}</TableCell>
                  <TableCell className="font-medium text-calculator-primary">{result.ppdAddress}</TableCell>
                  <TableCell>{result.dhcpRange}</TableCell>
                  <TableCell>{result.staticPool}</TableCell>
                  <TableCell>{result.intermediateDevices}</TableCell>
                  <TableCell>{result.servers}</TableCell>
                  <TableCell>{result.printers}</TableCell>
                  <TableCell>{result.others}</TableCell>
                  <TableCell>{result.broadcastAddress}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4 text-gray-500">
                  No results to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ResultsTable;
