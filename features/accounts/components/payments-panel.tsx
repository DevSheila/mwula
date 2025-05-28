"use client";

import { Search } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Account {
    id: string;
    name: string;
    institutionName: string;
    accountNumber: string;
    currency: string;
}

interface Transaction {
    id: string;
    date: string;
    category?: string;
    categoryId?: string;
    isUniversal?: number;
    payee: string;
    amount: number;
    notes?: string;
    account: string;
    accountId: string;
    currency: string;
    institutionName: string;
    accountNumber: string;
}

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
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

    const transactionsQuery = useGetTransactions();
    const transactions = transactionsQuery.data || [];

    // Filter transactions based on search query
    const filteredTransactions = transactions.filter(transaction =>
        transaction.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
        const date = format(new Date(transaction.date), "dd MMM yyyy");
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {} as Record<string, Transaction[]>);

    // Get upcoming payments (transactions with future dates)
    const upcomingPayments = filteredTransactions.filter(
        (transaction) => new Date(transaction.date) > new Date()
    );

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
        const initials = getInitials(transaction.payee);
        const colors = generatePastelColor(transaction.payee);

        return (
            <div
                key={transaction.id}
                className="flex items-center justify-between  rounded-lg hover:bg-slate-50 transition-colors"
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
                        {/* {transaction.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {transaction.notes}
                            </p>
                        )} */}
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
                    <TabsContent value="all" className="mt-4 space-y-8">
                        {Object.entries(groupedTransactions).map(([date, transactions]) => (
                            <div key={date}>
                                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                                    {date}
                                </h3>
                                <div className="space-y-2 divide-y divide-slate-100">
                                    {transactions.map((transaction) => (
                                        <TransactionItem
                                            key={transaction.id}
                                            transaction={transaction}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {Object.keys(groupedTransactions).length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No transactions found</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="regular" className="mt-4">
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="mb-4 text-sm font-medium">
                                Upcoming Payments
                            </h3>
                            <div className="space-y-2 divide-y divide-slate-100">
                                {upcomingPayments.map((payment) => (
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