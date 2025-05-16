"use client";

import { Loader2, Plus } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { useGetBudgetSummary } from "@/features/budgets/api/use-get-budget-summary";
import { useBulkDeleteBudgets } from "@/features/budgets/api/use-bulk-delete-budgets";
import { NewBudgetSheet } from "@/features/budgets/components/new-budget-sheet";
import { EditBudgetSheet } from "@/features/budgets/components/edit-budget-sheet";
import { BudgetTransactionsSheet } from "@/features/budgets/components/budget-transactions-sheet";
import { useOpenBudget } from "@/features/budgets/hooks/use-open-budget";

import { columns } from "./columns";

export default function BudgetsPage() {
  const { onOpen: onOpenNewBudget } = useNewBudget();
  const { onOpen: onOpenBudget } = useOpenBudget();
  const budgetsQuery = useGetBudgetSummary();
  const deleteBudgets = useBulkDeleteBudgets();
  const budgets = budgetsQuery.data || [];

  const isDisabled = budgetsQuery.isLoading || deleteBudgets.isPending;

  if (budgetsQuery.isLoading) {
    return (
      <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>

          <CardContent>
            <div className="flex h-[500px] w-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="line-clamp-1 text-xl">Budgets</CardTitle>

          <div className="flex flex-col items-center gap-x-2 gap-y-2 lg:flex-row">
            <Button
              size="sm"
              onClick={onOpenNewBudget}
              className="w-full lg:w-auto"
            >
              <Plus className="mr-2 size-4" /> New budget
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            filterKey="name"
            columns={columns}
            data={budgets}
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteBudgets.mutate({ ids });
            }}
            onRowClick={(row) => onOpenBudget(row.id)}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>

      <NewBudgetSheet />
      <EditBudgetSheet />
      <BudgetTransactionsSheet />
    </div>
  );
} 