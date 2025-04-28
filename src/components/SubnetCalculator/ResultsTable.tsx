
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const ResultsTable = () => {
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
            {Array(4).fill(null).map((_, index) => (
              <TableRow key={index} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ResultsTable;
