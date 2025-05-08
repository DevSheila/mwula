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
        header: "Account Number",
        cell: ({ row }) => {
            return <span>#{row.getValue("accountNumber")}</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }
]
