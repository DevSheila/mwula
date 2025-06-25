"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaWallet, FaArrowCircleUp, FaArrowCircleDown } from "react-icons/fa";

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
import { DataCard, DataCardLoading } from "@/components/data-card";

interface SummaryResponse {
  remainingAmount: number;
  remainingChange: number;
  incomeAmount: number;
  incomeChange: number;
  expensesAmount: number;
  expensesChange: number;
  categories: Array<{
    value: number;
    name: string;
  }>;
  days: Array<{
    income: number;
    expenses: number;
    date: string;
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

  // Since we don't have account-specific data in the summary response,
  // we'll just use the overall data regardless of account selection
  const filteredData = data ? {
    remainingAmount: data.remainingAmount,
    remainingChange: data.remainingChange,
    incomeAmount: data.incomeAmount,
    incomeChange: data.incomeChange,
    expensesAmount: data.expensesAmount,
    expensesChange: data.expensesChange,
    categories: data.categories,
    days: data.days
  } : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  if (!filteredData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DataCard
        title="Balance"
        value={filteredData.remainingAmount}
        percentageChange={filteredData.remainingChange}
        icon={FaWallet}
        variant="default"
        dateRange={dateRangeLabel}
        currency={selectedCurrency}
      />
      <DataCard
        title="Income"
        value={filteredData.incomeAmount}
        percentageChange={filteredData.incomeChange}
        icon={FaArrowCircleUp}
        variant="success"
        dateRange={dateRangeLabel}
        currency={selectedCurrency}
      />
      <DataCard
        title="Expenses"
        value={filteredData.expensesAmount}
        percentageChange={filteredData.expensesChange}
        icon={FaArrowCircleDown}
        variant="danger"
        dateRange={dateRangeLabel}
        currency={selectedCurrency}
      />
    </div>
  );
};