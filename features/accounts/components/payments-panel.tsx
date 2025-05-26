"use client";

import { Search } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTransactions } from "@/features/accounts/api/use-get-transactions";
import { cn, formatCurrency } from "@/lib/utils";

interface Account {
    id: string;
    name: string;
    institutionName: string;
    accountNumber: string;
    currency: string;
}

interface PaymentsPanelProps {
    accounts: Account[];
}

export const PaymentsPanel = ({ accounts }: PaymentsPanelProps) => {
    const transactionsQuery = useGetTransactions({
        accountId: accounts[0]?.id,
    });

    const transactions = transactionsQuery.data || [];

    // Group transactions by date
    const groupedTransactions = transactions.reduce((acc, transaction) => {
        const date = format(new Date(transaction.date), "dd MMM yyyy");
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {} as Record<string, typeof transactions>);

    // Get upcoming payments (transactions with future dates)
    const upcomingPayments = transactions.filter(
        (transaction) => new Date(transaction.date) > new Date()
    );

    return (
        <Card className="border-none drop-shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">My Payments</CardTitle>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">All Payments</TabsTrigger>
                        <TabsTrigger value="regular">Regular Payments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4 space-y-8">
                        {Object.entries(groupedTransactions).map(([date, transactions]) => (
                            <div key={date}>
                                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                                    {date}
                                </h3>
                                <div className="space-y-4">
                                    {transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                    <img
                                                        src={`/logos/${transaction.payee.toLowerCase()}.png`}
                                                        alt={transaction.payee}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/logos/default.png";
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {transaction.payee}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(
                                                            new Date(transaction.date),
                                                            "dd MMM yyyy, hh:mm a"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <p
                                                className={cn(
                                                    "font-medium",
                                                    transaction.amount < 0
                                                        ? "text-red-600"
                                                        : "text-emerald-600"
                                                )}
                                            >
                                                {transaction.amount < 0 ? "-" : "+"}
                                                {formatCurrency(Math.abs(transaction.amount))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                    <TabsContent value="regular" className="mt-4">
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="mb-4 text-sm font-medium">
                                Upcoming Payments
                            </h3>
                            <div className="space-y-4">
                                {upcomingPayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                <img
                                                    src={`/logos/${payment.payee.toLowerCase()}.png`}
                                                    alt={payment.payee}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/logos/default.png";
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {payment.payee}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(
                                                        new Date(payment.date),
                                                        "dd MMM yyyy, hh:mm a"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-medium">
                                            {formatCurrency(Math.abs(payment.amount))}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}; 