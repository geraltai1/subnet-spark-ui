
import React from "react";
import SubnetCalculatorForm from "@/components/SubnetCalculator/SubnetCalculatorForm";
import ResultsTable from "@/components/SubnetCalculator/ResultsTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subnet Calculator</h1>
          <p className="text-gray-600 text-lg">
            Calculate IP subnets, DHCP ranges, and more with this simple tool
          </p>
        </div>
        
        <div className="space-y-8">
          <SubnetCalculatorForm />
          
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
            <ResultsTable />
          </div>
        </div>
        
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Enter your network details above and click 'Calculate' to see the results</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
