"use client";

import { Search } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTransactions, type Transaction as ApiTransaction } from "@/features/transactions/api/use-get-transactions";
import { cn, formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { columns } from "@/app/(dashboard)/transactions/columns";

interface Account {
    id: string;
    name: string;
    institutionName: string;
    accountNumber: string;
    currency: string;
}

type Transaction = ApiTransaction;

interface PaymentsPanelProps {
    accounts: Account[];
}

// Utility function to generate initials and colors
const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const generatePastelColor = (str: string): { bg: string; text: string } => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate pastel background color
    const hue = hash % 360;
    const bg = `hsl(${hue}, 70%, 90%)`;
    const text = `hsl(${hue}, 70%, 30%)`; // Darker shade for text

    return { bg, text };
};

export const PaymentsPanel = ({ accounts }: PaymentsPanelProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

    // Get pagination parameters from URL
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const accountId = searchParams.get("accountId") || undefined;

    // Fetch transactions with pagination
    const transactionsQuery = useGetTransactions();
    const transactions = transactionsQuery.data?.data || [];
    const pagination = transactionsQuery.data?.pagination;

    // Handle page change
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    // Filter transactions based on search query
    const filteredTransactions = transactions.filter((transaction: Transaction) =>
        transaction.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
        const date = format(new Date(transaction.date), "dd MMM yyyy");
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {});

    // Get upcoming payments (transactions with future dates)
    const upcomingPayments = filteredTransactions.filter(
        (transaction: Transaction) => new Date(transaction.date) > new Date()
    );

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // Reset to first page when searching
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
        const initials = getInitials(transaction.payee);
        const colors = generatePastelColor(transaction.payee);

        return (
            <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="flex p-2 items-center justify-center rounded-full text-base font-semibold"
                        style={{
                            backgroundColor: colors.bg,
                            color: colors.text
                        }}
                    >
                        {initials}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                                {transaction.payee}
                            </p>
                            {transaction.category && (
                                <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                                    {transaction.category}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {format(
                                new Date(transaction.date),
                                "dd MMM yyyy, hh:mm a"
                            )}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p
                        className={cn(
                            "font-medium text-sm",
                            transaction.amount < 0
                                ? "text-red-500"
                                : "text-emerald-500"
                        )}
                    >
                        <span className="inline-flex items-center">
                            {transaction.amount < 0 ? "-" : "+"}
                            {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {transaction.account}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <Card className="border-none drop-shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">My Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative w-full max-w-sm mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger className="text-xs" value="all">All Transactions</TabsTrigger>
                        <TabsTrigger className="text-xs" value="regular">Regular Transactions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                        <DataTable
                            columns={columns}
                            data={transactions}
                            filterKey="payee"
                            pagination={pagination}
                            disabled={transactionsQuery.isLoading}
                        />
                    </TabsContent>
                    <TabsContent value="regular" className="mt-4">
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="mb-4 text-sm font-medium">
                                Upcoming Payments
                            </h3>
                            <div className="space-y-2 divide-y divide-slate-100">
                                {upcomingPayments.map((payment: Transaction) => (
                                    <TransactionItem
                                        key={payment.id}
                                        transaction={payment}
                                    />
                                ))}
                                {upcomingPayments.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No upcoming payments</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}; 