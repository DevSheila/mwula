"use client";

import { Loader2, Plus } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBudgets } from "@/features/budgets/api/use-get-budgets";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { EditBudgetSheet } from "@/features/budgets/components/edit-budget-sheet";
import { NewBudgetSheet } from "@/features/budgets/components/new-budget-sheet";
import { useBulkDeleteBudgets } from "@/features/budgets/api/use-bulk-delete-budgets";

import { columns } from "./columns";

const BudgetsPage = () => {
  const newBudget = useNewBudget();
  const budgetsQuery = useGetBudgets();
  const deleteBudgets = useBulkDeleteBudgets();
  const budgets = budgetsQuery.data || [];

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
    <>
      <NewBudgetSheet />
      <EditBudgetSheet />

      <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="line-clamp-1 text-xl">
              Budget Management
            </CardTitle>

            <div className="flex flex-col items-center gap-x-2 gap-y-2 lg:flex-row">
              <Button
                size="sm"
                onClick={newBudget.onOpen}
                className="w-full lg:w-auto"
              >
                <Plus className="mr-2 size-4" /> Add new
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              filterKey="name"
              columns={columns}
              data={budgets}
              disabled={budgetsQuery.isLoading || deleteBudgets.isPending}
              onDelete={(rows) => {
                const ids = rows.map((row) => row.original.id);
                deleteBudgets.mutate({ ids });
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BudgetsPage; 