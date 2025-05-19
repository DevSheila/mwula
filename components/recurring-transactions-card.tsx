"use client";

import { Loader2 } from "lucide-react";

import { useGetRecurringTransactions } from "@/features/transactions/api/use-get-recurring-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const periodColors = {
  weekly: "bg-blue-100 text-blue-800",
  "bi-weekly": "bg-purple-100 text-purple-800",
  monthly: "bg-green-100 text-green-800",
  quarterly: "bg-orange-100 text-orange-800",
  yearly: "bg-red-100 text-red-800",
  irregular: "bg-gray-100 text-gray-800",
} as const;

export const RecurringTransactionsCard = () => {
  const { data, isLoading } = useGetRecurringTransactions();

  if (isLoading) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-300" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-slate-500">
            No recurring transactions detected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Recurring Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((transaction) => (
            <div
              key={`${transaction.payee}-${transaction.amount}`}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="font-medium">{transaction.payee}</div>
                <div className="text-sm text-slate-500">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={periodColors[transaction.period as keyof typeof periodColors]}
                >
                  {transaction.period}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    transaction.confidence >= 90
                      ? "bg-green-100 text-green-800"
                      : transaction.confidence >= 80
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-orange-100 text-orange-800"
                  }
                >
                  {transaction.confidence}% confident
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 