import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { useOpenBudget } from "@/features/budgets/hooks/use-open-budget";
import { useGetBudgetSummary, BudgetSummary } from "@/features/budgets/api/use-get-budget-summary";
import { Card, CardContent } from "@/components/ui/card";

const columns: ColumnDef<BudgetSummary>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const categories = row.original.categories || [];
      const firstCategory = categories[0]?.name;
      return (
        <span className="font-medium">
          {name || firstCategory || "Untitled Budget"}
        </span>
      );
    }
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "spent",
    header: "Spent",
  },
  {
    accessorKey: "remaining",
    header: "Remaining",
  },
  {
    accessorKey: "progress",
    header: "Progress",
  },
  {
    accessorKey: "period",
    header: "Period",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string;
      const formatted = format(new Date(date), "MMM d, yyyy");
      return <div>{formatted}</div>;
    },
  },
];

export const BudgetList = () => {
  const { onOpen } = useOpenBudget();
  const { data, isLoading } = useGetBudgetSummary();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <DataTable<BudgetSummary, unknown>
      columns={columns}
      data={data ?? []}
      filterKey="name"
      onRowClick={(row: Row<BudgetSummary>) => onOpen(row.original.id)}
    />
  );
}; 