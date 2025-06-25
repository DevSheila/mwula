import { InferResponseType } from "hono";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { Actions } from "./actions";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  try {
    return format(parseISO(date), "MMM d, yyyy");
  } catch (error) {
    return "-";
  }
};

export type ResponseType = InferResponseType<typeof client.api.budgets.summary.$get, 200>["data"][0];

export const columns: ColumnDef<ResponseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const categories = row.original.categories || [];
      const firstCategory = categories[0]?.name;
      return (
        <span className="font-medium">
          {name || firstCategory || "Untitled Budget"}
        </span>
      )
    }
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Target
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = Math.abs(parseFloat(row.getValue("amount")));
      return (
        <Badge variant="outline" className="text-xs font-medium px-3.5 py-2.5">
          {formatCurrency(amount)}
        </Badge>
      )
    }
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
      const progress = row.getValue("progress") as number;

      let textColor = "text-muted-foreground";
      if (progress >= 100) {
        textColor = "text-destructive font-medium";
      } else if (progress >= 80) {
        textColor = "text-warning font-medium";
      }

      return (
        <div className={textColor}>
          {formatted}
        </div>
      );
    }
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
      const progress = row.getValue("progress") as number;

      let textColor = "text-muted-foreground";
      if (remaining < 0) {
        textColor = "text-destructive font-medium";
      } else if (progress >= 80) {
        textColor = "text-warning font-medium";
      } else if (progress < 80) {
        textColor = "text-primary font-medium";
      }

      return (
        <div className={textColor}>
          {formatted}
        </div>
      );
    }
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      const remaining = row.getValue("remaining") as number;
      const spent = row.getValue("spent") as number;
      const amount = row.getValue("amount") as number;
      
      // Calculate actual percentage (can go over 100%)
      const actualPercentage = (spent / amount) * 100;
      
      // Determine status color and text color
      let statusColor = "destructive";
      let textColor = "text-green-500";
      
      if (remaining < 0) {
        statusColor = "destructive";
        textColor = "text-red-500 font-medium";
      } else if (progress >= 80) {
        statusColor = "warning";
        textColor = "text-yellow-500 font-medium";
      } else {
        textColor = "text-green-500 font-medium";
      }

      // Format percentage display
      const percentageDisplay = remaining < 0 
        ? `-${actualPercentage.toFixed(1)}%`
        : `${Math.min(actualPercentage, 100).toFixed(1)}%`;

      return (
        <div className="w-[160px] space-y-1">
          <div className="flex justify-between text-xs">
            <span className={textColor}>{percentageDisplay}</span>
          </div>
          <Progress 
            value={Math.min(progress, 100)} 
            className={statusColor}
            style={{
              "--progress-background": "hsl(var(--muted))",
              "--progress-foreground": `hsl(var(--${statusColor}))`,
            } as React.CSSProperties}
          />
        </div>
      );
    }
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const period = row.getValue("period") as string;
      return (
        <Badge variant="secondary" className="capitalize">
          {period}
        </Badge>
      )
    }
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string | undefined;
      return (
        <span className="text-muted-foreground">
          {formatDate(date)}
        </span>
      )
    }
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("endDate") as string | undefined;
      return (
        <span className="text-muted-foreground">
          {formatDate(date)}
        </span>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions id={row.original.id} />
  }
] 