"use client";

import { Search } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { cn, formatCurrency } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
    category: string | null;
    categoryId: string | null;
    isUniversal: number | null;
    payee: string;
    amount: number;
    notes: string | null;
    account: string;
    accountId: string;
    currency: string;
    institutionName: string;
    accountNumber: string;
}

interface PaymentsPanelProps {
    accounts: Account[];
}

const ITEMS_PER_PAGE = 8;

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
    const [currentPage, setCurrentPage] = useState(1);

    const transactionsQuery = useGetTransactions();
    const transactions = transactionsQuery.data || [];

    // Filter transactions based on search query
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction =>
            transaction.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [transactions, searchQuery]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Group paginated transactions by date
    const groupedTransactions = useMemo(() => {
        return paginatedTransactions.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), "dd MMM yyyy");
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(transaction);
            return acc;
        }, {} as Record<string, Transaction[]>);
    }, [paginatedTransactions]);

    // Get upcoming payments (transactions with future dates)
    const upcomingPayments = useMemo(() => {
        return filteredTransactions.filter(
            (transaction) => new Date(transaction.date) > new Date()
        ).slice(0, ITEMS_PER_PAGE); // Only show first page of upcoming payments
    }, [filteredTransactions]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of transaction list
        document.getElementById('transactions-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
        const initials = getInitials(transaction.payee);
        const colors = generatePastelColor(transaction.payee);

        return (
            <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg hover:bg-slate-50 transition-colors py-4"
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
                                <Badge 
                                    variant="primary"
                                    className="text-xs"
                                >
                                    {transaction.category}
                                </Badge>
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
                    <TabsContent value="all" className="mt-4 space-y-8" id="transactions-list">
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
                        {totalPages > 1 && (
                            <Pagination className="mt-4">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                            aria-disabled={currentPage === 1}
                                            className={cn(
                                                currentPage === 1 && "pointer-events-none opacity-50"
                                            )}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => handlePageChange(page)}
                                                isActive={page === currentPage}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext 
                                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                            aria-disabled={currentPage === totalPages}
                                            className={cn(
                                                currentPage === totalPages && "pointer-events-none opacity-50"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
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