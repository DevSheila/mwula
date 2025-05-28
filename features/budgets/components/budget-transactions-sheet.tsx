import { Edit, Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useGetBudget } from "@/features/budgets/api/use-get-budget";
import { useGetBudgetTransactions } from "@/features/budgets/api/use-get-budget-transactions";
import { useOpenBudget } from "@/features/budgets/hooks/use-open-budget";
import { useEditBudget } from "@/features/budgets/hooks/use-edit-budget";
import { columns, ResponseType as TransactionType } from "@/app/(dashboard)/transactions/columns";

export const BudgetTransactionsSheet = () => {
  const { isOpen, onClose, id } = useOpenBudget();
  const { onOpen: onOpenEdit } = useEditBudget();
  const budgetQuery = useGetBudget(id);
  const transactionsQuery = useGetBudgetTransactions(id);

  const isLoading = budgetQuery.isLoading || transactionsQuery.isLoading;
  const transactions = (transactionsQuery.data || []) as TransactionType[];
  const budget = budgetQuery.data;

  const handleEdit = () => {
    if (id) {
      onClose();
      onOpenEdit(id);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-[1200px]">
        <SheetHeader className="flex-row items-center justify-between">
          <div>
            <SheetTitle>
              {budget?.name || "Budget"} Transactions
            </SheetTitle>
            <SheetDescription>
              Categories: {budget?.categories?.map(c => c.name).join(", ")}
              <br />
              Showing transactions from {budget?.startDate ? new Date(budget.startDate).toLocaleDateString() : ''} 
              to {budget?.endDate ? new Date(budget.endDate).toLocaleDateString() : ''}
            </SheetDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="mr-2 size-4" />
            Edit Budget
          </Button>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-[500px] w-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="mt-4">
            <DataTable
              filterKey="payee"
              columns={columns}
              data={transactions}
              disabled={false}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}; 