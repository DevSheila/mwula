"use client";

import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { WalletPanel } from "@/features/accounts/components/wallet-panel";
import { PaymentsPanel } from "@/features/accounts/components/payments-panel";

const AccountsPage = () => {
    const newAccount = useNewAccount();
    const accountsQuery = useGetAccounts();
    const accounts = accountsQuery.data || [];

    if (accountsQuery.isLoading) {
        return (
            <div className="mx-auto w-full max-w-screen-2xl p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4">
                        <Card className="border-none drop-shadow-sm">
                            <CardHeader>
                                <Skeleton className="h-8 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex h-[400px] w-full items-center justify-center">
                                    <Loader2 className="size-6 animate-spin text-slate-300" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-8">
                        <Card className="border-none drop-shadow-sm">
                            <CardHeader>
                                <Skeleton className="h-8 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex h-[400px] w-full items-center justify-center">
                                    <Loader2 className="size-6 animate-spin text-slate-300" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-6 py-6 mx-auto">
            <div className="flex flex-wrap -mx-3">
                <div className="max-w-full lg:w-2/5 lg:flex-none">
                    <WalletPanel
                        accounts={accounts}
                        onAddCard={newAccount.onOpen}
                    />
                </div>

                <div className="w-full max-w-full px-3 lg:w-3/5 lg:flex-none">
                    <PaymentsPanel accounts={accounts} />

                </div>
            </div>

            <NewAccountSheet />
            <EditAccountSheet />
        </div>
    );
};

export default AccountsPage;