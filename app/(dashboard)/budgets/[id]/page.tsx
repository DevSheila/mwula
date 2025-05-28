"use client";

import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { useGetBudget } from "@/features/budgets/api/use-get-budget";
import { useGetBudgetTransactions } from "@/features/budgets/api/use-get-budget-transactions";
import { useEditBudget } from "@/features/budgets/hooks/use-edit-budget";
import { EditBudgetSheet } from "@/features/budgets/components/edit-budget-sheet";
import { columns } from "../../transactions/columns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function BudgetTransactionsPage() {
  const params = useParams();
  const id = params.id as string;
  const { onOpen: onOpenEdit } = useEditBudget();
  const budgetQuery = useGetBudget(id);
  const transactionsQuery = useGetBudgetTransactions(id);

  const isLoading = budgetQuery.isLoading || transactionsQuery.isLoading;
  const transactions = transactionsQuery.data || [];
  const budget = budgetQuery.data;

  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground mb-4">
          Budget not found
        </p>
        <Button asChild variant="outline">
          <Link href="/budgets">
            <ArrowLeft className="mr-2 size-4" />
            Back to Budgets
          </Link>
        </Button>
      </div>
    );
  }

  // Calculate total spent from transactions
  const totalSpent = transactions.reduce((sum, transaction) => {
    // Only include expenses (negative amounts)
    return transaction.amount < 0 ? sum + Math.abs(transaction.amount) : sum;
  }, 0);

  const remaining = budget.amount - totalSpent;
  const progress = (totalSpent / budget.amount) * 100;

  const getStatus = () => {
    if (progress === 0) return { text: "Not started", color: "text-muted-foreground", progressColor: "bg-muted" };
    if (remaining < 0) return { text: "Over budget", color: "text-destructive", progressColor: "bg-destructive" };
    if (progress >= 80) return { text: "Near limit", color: "text-amber-500", progressColor: "bg-amber-500" };
    return { text: "Under budget", color: "text-emerald-500", progressColor: "bg-emerald-500" };
  };

  const status = getStatus();

  return (
    <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="mb-2"
              >
                <Link href="/budgets">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Budgets
                </Link>
              </Button>
            </div>
            <CardTitle className="text-2xl">
              {budget.name || budget.categories[0]?.name || "Untitled Budget"}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                {budget.categories.map(category => (
                  <Badge 
                    key={category.id} 
                    variant="secondary"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
              <span>•</span>
              <span>
                {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => onOpenEdit(id)}>
            <Edit className="mr-2 size-4" />
            Edit Budget
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Budget</div>
                <div className="text-2xl font-bold">{formatCurrency(budget.amount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Spent</div>
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className={`text-2xl font-bold ${status.color}`}>
                  {formatCurrency(remaining)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.text}
                  </span>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(progress, 100)} 
                  className="h-2"
                  indicatorClassName={status.progressColor}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                filterKey="payee"
                columns={columns}
                data={transactions}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <EditBudgetSheet />
    </div>
  );
}