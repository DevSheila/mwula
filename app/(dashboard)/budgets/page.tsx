"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BudgetList } from "@/features/budgets/components/budget-list";
import { EditBudgetSheet } from "@/features/budgets/components/edit-budget-sheet";
import { NewBudgetSheet } from "@/features/budgets/components/new-budget-sheet";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";

export default function BudgetsPage() {
  const { onOpen } = useNewBudget();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Manage your spending limits and track your progress.
          </p>
        </div>

        <Button onClick={onOpen}>
          <Plus className="mr-2 size-4" />
          New budget
        </Button>
      </div>

      <BudgetList />

      <NewBudgetSheet />
      <EditBudgetSheet />
    </div>
  );
} 