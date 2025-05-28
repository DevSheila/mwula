import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Progress } from "@/components/ui/progress";
import { useGetBudgetSummary } from "@/features/budgets/api/use-get-budget-summary";
import { useOpenBudget } from "@/features/budgets/hooks/use-open-budget";
import { formatCurrency } from "@/lib/utils";


type Budget = {
  id: string;
  name: string | null;
  categories: Array<{ id: string; name: string }>;
  amount: number;
  spent: number;
  remaining: number;
  progress: number;
  period: string;
  startDate: string;
};

const columns: ColumnDef<Budget>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null;
      const category = row.getValue("category") as string | null;

      return <div>{name || category || "Untitled"}</div>;
    },
  },
  {
    accessorKey: "categories",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categories
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const categories = row.getValue("categories") as Array<{ id: string; name: string }>;
      return (
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <span key={category.id} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs">
              {category.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Budget
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const formatted = formatCurrency(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "spent",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Spent
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const spent = row.getValue("spent") as number;
      const formatted = formatCurrency(spent);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "remaining",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Remaining
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const remaining = row.getValue("remaining") as number;
      const formatted = formatCurrency(remaining);

      return (
        <div className={remaining < 0 ? "text-destructive" : "text-primary"}>
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;

      return (
        <div className="w-[100px]">
          <Progress value={progress} className="h-2 w-full" />
        </div>
      );
    },
  },
  {
    accessorKey: "period",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Period
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const period = row.getValue("period") as string;
      const formatted = period.charAt(0).toUpperCase() + period.slice(1);

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
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

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      onRowClick={(row) => onOpen(row.id)}
    />
  );
}; 