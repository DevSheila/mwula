"use client"

import { InferResponseType } from "hono";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { 
  ArrowUpDown,
  ShoppingBasket,
  Pizza,
  Home,
  Plug,
  Wifi,
  Bus,
  ShieldCheck,
  Stethoscope,
  Book,
  PiggyBank,
  Tv,
  Plane,
  Shirt,
  Scissors,
  Gift,
  Repeat,
  Wrench,
  PawPrint,
  Baby,
  TrendingUp,
  CreditCard,
  DollarSign,
  FileText,
  AlertTriangle,
  MoreHorizontal,
  LucideIcon,
  LucideProps
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { Actions } from "./actions";

// Icon mapping object
const iconMap: Record<string, LucideIcon> = {
  "shopping-basket": ShoppingBasket,
  "pizza": Pizza,
  "home": Home,
  "plug": Plug,
  "wifi": Wifi,
  "bus": Bus,
  "shield-check": ShieldCheck,
  "stethoscope": Stethoscope,
  "book": Book,
  "piggy-bank": PiggyBank,
  "tv": Tv,
  "plane": Plane,
  "shirt": Shirt,
  "scissors": Scissors,
  "gift": Gift,
  "repeat": Repeat,
  "wrench": Wrench,
  "paw-print": PawPrint,
  "baby": Baby,
  "trending-up": TrendingUp,
  "credit-card": CreditCard,
  "dollar-sign": DollarSign,
  "file-text": FileText,
  "alert-triangle": AlertTriangle,
  "more-horizontal": MoreHorizontal,
};

export type ResponseType = InferResponseType<typeof client.api.categories.$get, 200>["data"][0];

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
    }
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => {
      const icon = row.original.icon;
      const IconComponent = iconMap[icon];
      
      return (
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          <span className="text-sm text-muted-foreground">{icon}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "isUniversal",
    header: "Type",
    cell: ({ row }) => (
      <span>
        {row.original.isUniversal ? "Universal" : "User"}
      </span>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions id={row.original.id} isUniversal={row.original.isUniversal} />
  }
]
