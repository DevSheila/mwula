import { Loader2 } from "lucide-react";
import { z } from "zod";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertBudgetSchema } from "@/db/schema";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useDeleteBudget } from "@/features/budgets/api/use-delete-budget";
import { useEditBudget as useEditBudgetMutation } from "@/features/budgets/api/use-edit-budget";
import { useGetBudget } from "@/features/budgets/api/use-get-budget";
import { useEditBudget } from "@/features/budgets/hooks/use-edit-budget";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountToMiliunits } from "@/lib/utils";

import { BudgetForm } from "./budget-form";

const formSchema = insertBudgetSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

type FormValues = z.infer<typeof formSchema>;
type ApiFormValues = {
  name?: string;
  categoryIds: string[];
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  endDate: string;
};

export const EditBudgetSheet = () => {
  const { isOpen, onClose, id } = useEditBudget();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this budget."
  );

  const budgetQuery = useGetBudget(id);
  const editMutation = useEditBudgetMutation(id);
  const deleteMutation = useDeleteBudget(id);

  const categoryMutation = useCreateCategory();
  const categoryQuery = useGetCategories();
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const onCreateCategory = (name: string) => categoryMutation.mutate({ name });

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    budgetQuery.isLoading ||
    categoryMutation.isPending;

  const isLoading = budgetQuery.isLoading || categoryQuery.isLoading;

  const onSubmit = (values: ApiFormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const defaultValues = budgetQuery.data
    ? {
        name: budgetQuery.data.name || undefined,
        categoryIds: budgetQuery.data.categories?.map(c => c.id) || [],
        amount: budgetQuery.data.amount.toString(),
        period: budgetQuery.data.period,
        startDate: new Date(budgetQuery.data.startDate),
        endDate: new Date(budgetQuery.data.endDate),
      }
    : undefined;

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen || isPending} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Budget</SheetTitle>

            <SheetDescription>Edit an existing budget.</SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <BudgetForm
              id={id}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              disabled={isPending}
              categoryOptions={categoryOptions}
              onCreateCategory={onCreateCategory}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}; 