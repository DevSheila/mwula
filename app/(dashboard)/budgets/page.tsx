"use client";

import { Loader2, Plus, Search, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { useGetBudgetSummary } from "@/features/budgets/api/use-get-budget-summary";
import { useDeleteBudget } from "@/features/budgets/api/use-delete-budget";
import { NewBudgetSheet } from "@/features/budgets/components/new-budget-sheet";
import { EditBudgetSheet } from "@/features/budgets/components/edit-budget-sheet";
import { useEditBudget } from "@/features/budgets/hooks/use-edit-budget";
import { BudgetCard } from "@/features/budgets/components/budget-card";
import { useConfirm } from "@/hooks/use-confirm";

type SortField = "name" | "startDate" | "amount" | "spent" | "progress";
type SortOrder = "asc" | "desc";

export default function BudgetsPage() {
  const { onOpen: onOpenNewBudget } = useNewBudget();
  const { onOpen: onOpenEdit } = useEditBudget();
  const budgetsQuery = useGetBudgetSummary();
  const deleteBudget = useDeleteBudget();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this budget."
  );

  const handleDelete = async (id: string) => {
    const ok = await confirm();
    if (ok) {
      deleteBudget.mutate(id);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedBudgets = useMemo(() => {
    const budgets = budgetsQuery.data || [];
    
    // Filter based on search term
    const filtered = search
      ? budgets.filter((budget) => {
          const searchTerm = search.toLowerCase();
          return (
            budget.name?.toLowerCase().includes(searchTerm) ||
            budget.categories.some((cat) =>
              cat.name.toLowerCase().includes(searchTerm)
            )
          );
        })
      : budgets;

    // Sort based on current sort field and order
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "startDate":
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "spent":
          comparison = a.spent - b.spent;
          break;
        case "progress":
          comparison = a.progress - b.progress;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [budgetsQuery.data, search, sortField, sortOrder]);

  if (budgetsQuery.isLoading) {
    return (
      <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[250px] w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="line-clamp-1 text-xl">Budgets</CardTitle>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search budgets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-full lg:w-[250px]"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full lg:w-auto">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort by {sortField}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleSort("name")}>
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("startDate")}>
                    Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("amount")}>
                    Budget Amount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("spent")}>
                    Amount Spent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("progress")}>
                    Progress
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                onClick={onOpenNewBudget}
                className="w-full lg:w-auto"
              >
                <Plus className="mr-2 size-4" /> New budget
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAndSortedBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-muted-foreground mb-4">
                {search ? "No budgets found matching your search" : "No budgets found"}
              </p>
              <Button onClick={onOpenNewBudget} variant="outline">
                <Plus className="mr-2 size-4" /> Create your first budget
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  {...budget}
                  onEdit={onOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog />
      <NewBudgetSheet />
      <EditBudgetSheet />
    </div>
  );
} 