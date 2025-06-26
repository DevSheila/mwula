import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { convertAmounts } from "@/lib/currency-converter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import currencies from "@/lib/currencies";
import { Skeleton } from "@/components/ui/skeleton";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";

interface Account {
    id: string;
    name: string;
    institutionName: string;
    accountNumber: string;
    currency: string;
}

interface WalletPanelProps {
    accounts: Account[];
    onAddCard: () => void;
}

export const WalletPanel = ({ accounts, onAddCard }: WalletPanelProps) => {
    const [selectedCurrency, setSelectedCurrency] = useState("USD");
    const [convertedTotal, setConvertedTotal] = useState<number | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const { onOpen: onOpenEdit } = useOpenAccount();
    const transactionsQuery = useGetTransactions();
    const transactions = transactionsQuery.data || [];

    // Calculate cumulative transactions for each account
    const accountTransactions = accounts.map(account => {
        const accountTransactions = transactions.filter(t => t.accountId === account.id);
        const totalIncoming = accountTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const totalOutgoing = accountTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalTransactions = totalIncoming + totalOutgoing;
        
        return {
            ...account,
            totalTransactions,
            totalIncoming,
            totalOutgoing
        };
    });

    // Calculate total transactions with currency conversion
    useEffect(() => {
        const calculateTotal = async () => {
            setIsConverting(true);
            try {
                const amounts = accountTransactions.map(account => ({
                    amount: account.totalTransactions,
                    currency: account.currency
                }));
                
                const total = await convertAmounts(amounts, selectedCurrency);
                setConvertedTotal(total);
            } catch (error) {
                console.error("Failed to convert currencies:", error);
                // Fallback to simple sum without conversion
                const total = accountTransactions.reduce((sum, account) => sum + account.totalTransactions, 0);
                setConvertedTotal(total);
            } finally {
                setIsConverting(false);
            }
        };

        calculateTotal();
    }, [accountTransactions, selectedCurrency]);

    return (
        <div>
            {/* Account Cards */}
            <ScrollArea className="whitespace-nowrap">
                <div className="flex flex-nowrap gap-4">
                    {accountTransactions.map((account) => (
                        <div
                            key={account.id}
                            className="w-72 mb-4"
                        >
                            <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 border-transparent border-solid bg-clip-border">
                                <div
                                    className="relative overflow-hidden rounded-md p-4"
                                    style={{
                                        backgroundImage: "url('/curved14.jpg')"
                                    }}
                                >
                                    <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-gray-900 to-slate-800 opacity-80"></span>
                                    <div className="relative">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-white font-semibold">
                                                    {account.institutionName}
                                                </h4>
                                                <p className="text-white text-sm opacity-80">
                                                    {account.currency}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:text-white/80"
                                                onClick={() => onOpenEdit(account.id)}
                                            >
                                                <Edit className="size-4" />
                                            </Button>
                                        </div>
                                        <h5 className="pb-2 mt-6 mb-12 text-white text-sm">
                                            {account.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
                                        </h5>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <p className="mb-0 leading-normal text-white text-sm opacity-80">
                                                    Account Name
                                                </p>
                                                <h6 className="mb-0 text-white text-sm">
                                                    {account.name}
                                                </h6>
                                            </div>
                                            {/* <div>
                                                <p className="mb-0 leading-normal text-white text-sm opacity-80">
                                                    Total Transactions
                                                </p>
                                                <h6 className="mb-0 text-white text-sm">
                                                    {formatCurrency(account.totalTransactions, { currency: account.currency })}
                                                </h6>
                                            </div> */}
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="mb-0 leading-normal text-white text-sm opacity-80">
                                                        Incoming
                                                    </p>
                                                    <h6 className="mb-0 text-white text-sm">
                                                        {formatCurrency(account.totalIncoming, { currency: account.currency })}
                                                    </h6>
                                                </div>
                                                <div>
                                                    <p className="mb-0 leading-normal text-white text-sm opacity-80">
                                                        Outgoing
                                                    </p>
                                                    <h6 className="mb-0 text-white text-sm">
                                                        {formatCurrency(account.totalOutgoing, { currency: account.currency })}
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Total Transactions Card */}
            <Card className="mt-4">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Transactions</p>
                                {isConverting ? (
                                    <Skeleton className="h-8 w-32" />
                                ) : (
                                    <h2 className="text-md font-bold">
                                        {formatCurrency(convertedTotal || 0, { currency: selectedCurrency })}
                                    </h2>
                                )}
                            </div>
                            <Select
                                value={selectedCurrency}
                                onValueChange={setSelectedCurrency}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((currency) => (
                                        <SelectItem
                                            key={currency.code}
                                            value={currency.code}
                                        >
                                            {currency.code} - {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Number of Accounts</p>
                                <p className="text-sm font-medium">{accounts.length}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-sm font-medium">Active</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button
                onClick={onAddCard}
                variant="outline"
                className="w-full border-dashed mt-4"
            >
                <Plus className="mr-2 size-4" />
                Add New Account
            </Button>
        </div>
    );
}; 