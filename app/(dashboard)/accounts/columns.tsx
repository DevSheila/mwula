"use client"

import { InferResponseType } from "hono";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { Actions } from "./actions";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";

export type ResponseType = InferResponseType<typeof client.api.accounts.$get, 200>["data"][0];

interface Account {
    id: string;
    name: string;
    institutionName: string;
    accountNumber: string;
    currency: string;
}

export const columns: ColumnDef<Account>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
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
        header: "Account Name",
        cell: ({ row }) => {
            const { onOpen } = useOpenAccount();
            return (
                <Button
                    variant="ghost"
                    className="p-0 font-medium hover:underline"
                    onClick={() => onOpen(row.original.id)}
                >
                    {row.getValue("name")}
                </Button>
            );
        },
    },
    {
        accessorKey: "institutionName",
        header: "Institution",
    },
    {
        accessorKey: "accountNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Account Number
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const accountNumber = row.getValue("accountNumber");
            return accountNumber ? (
                <span className="font-medium">{accountNumber}</span>
            ) : (
                <span className="text-muted-foreground">Not provided</span>
            );
        },
    },
    {
        accessorKey: "currency",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Currency
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const currency = row.getValue("currency");
            return currency ? (
                <span className="font-medium">{currency}</span>
            ) : (
                <span className="text-muted-foreground">KES</span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }
]
