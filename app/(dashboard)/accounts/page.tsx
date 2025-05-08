"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";
import { columns } from "./columns";

const AccountsPage = () => {
    const newAccount = useNewAccount();
    const deleteAccounts = useBulkDeleteAccounts();
    const accountsQuery = useGetAccounts();
    const accounts = accountsQuery.data || [];

    const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending;

    if (accountsQuery.isLoading) {
        return (
            <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
                <Card className="border-none drop-shadow-sm">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[500px] w-full items-center justify-center">
                            <Loader2 className="size-6 animate-spin text-slate-300" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="line-clamp-1 text-xl">Accounts</CardTitle>
                    <Button size="sm" onClick={newAccount.onOpen}>
                        <Plus className="mr-2 size-4" /> Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        filterKey="name"
                        columns={columns}
                        data={accounts}
                        onDelete={(rows) => {
                            const ids = rows.map((row) => row.original.id);
                            deleteAccounts.mutate({ ids });
                        }}
                        disabled={isDisabled}
                    />
                </CardContent>
            </Card>
            <NewAccountSheet />
            <EditAccountSheet />
        </div>
    );
};

export default AccountsPage;