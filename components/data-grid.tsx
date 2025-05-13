"use client";

import { useSearchParams } from "next/navigation";
import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { formatDateRange } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import currencies from "@/lib/currencies";
import { DataCard, DataCardLoading } from "./data-card";
import { useState } from "react";

interface SummaryResponse {
  remainingAmount: number;
  remainingChange: number;
  incomeAmount: number;
  incomeChange: number;
  expensesAmount: number;
  expensesChange: number;
  accounts: Array<{
    id: string;
    name: string;
    currency: string;
  }>;
  accountBalances: Record<string, {
    balance: number;
    change: number;
  }>;
  accountIncomes: Record<string, {
    amount: number;
    change: number;
  }>;
  accountExpenses: Record<string, {
    amount: number;
    change: number;
  }>;
}

export const DataGrid = () => {
  const { data, isLoading } = useGetSummary();
  const searchParams = useSearchParams();
  const to = searchParams.get("to") || undefined;
  const from = searchParams.get("from") || undefined;
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedAccount, setSelectedAccount] = useState<string | "all">("all");

  const dateRangeLabel = formatDateRange({ to, from });

  const accounts = data?.accounts || [];
  
  // Filter transactions based on selected account
  const filteredData = selectedAccount === "all" 
    ? data
    : {
        ...data,
        remainingAmount: data?.accountBalances?.[selectedAccount]?.balance || 0,
        remainingChange: data?.accountBalances?.[selectedAccount]?.change || 0,
        incomeAmount: data?.accountIncomes?.[selectedAccount]?.amount || 0,
        incomeChange: data?.accountIncomes?.[selectedAccount]?.change || 0,
        expensesAmount: data?.accountExpenses?.[selectedAccount]?.amount || 0,
        expensesChange: data?.accountExpenses?.[selectedAccount]?.change || 0,
      };

  if (isLoading)
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap gap-4">
          <DataCardLoading />
          <DataCardLoading />
          <DataCardLoading />
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={selectedAccount}
          onValueChange={(value) => setSelectedAccount(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedCurrency}
          onValueChange={(value) => setSelectedCurrency(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Display Currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-2 lg:grid-cols-3">
        <DataCard
          title="Remaining"
          value={filteredData?.remainingAmount}
          percentageChange={filteredData?.remainingChange}
          icon={FaPiggyBank}
          variant="default"
          dateRange={dateRangeLabel}
          currency={selectedCurrency}
        />

        <DataCard
          title="Income"
          value={filteredData?.incomeAmount}
          percentageChange={filteredData?.incomeChange}
          icon={FaArrowTrendUp}
          variant="success"
          dateRange={dateRangeLabel}
          currency={selectedCurrency}
        />

        <DataCard
          title="Expenses"
          value={filteredData?.expensesAmount}
          percentageChange={filteredData?.expensesChange}
          icon={FaArrowTrendDown}
          variant="danger"
          dateRange={dateRangeLabel}
          currency={selectedCurrency}
        />
      </div>
    </div>
  );
};