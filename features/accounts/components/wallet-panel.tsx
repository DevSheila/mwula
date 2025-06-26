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

interface Account {
    id: string;
    name: string;
    institutionName: string;
    accountNumber: string;
    currency: string;
    balance?: number;
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

    // Calculate total balance with currency conversion
    useEffect(() => {
        const calculateTotal = async () => {
            setIsConverting(true);
            try {
                const amounts = accounts.map(account => ({
                    amount: account.balance || 0,
                    currency: account.currency
                }));
                
                const total = await convertAmounts(amounts, selectedCurrency);
                setConvertedTotal(total);
            } catch (error) {
                console.error("Failed to convert currencies:", error);
                // Fallback to simple sum without conversion
                const total = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
                setConvertedTotal(total);
            } finally {
                setIsConverting(false);
            }
        };

        calculateTotal();
    }, [accounts, selectedCurrency]);

    return (
        <div>
            {/* Account Cards */}
            <ScrollArea className="whitespace-nowrap">
                <div className="flex flex-nowrap gap-4">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="w-72 mb-4"
                        >
                            <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 border-transparent border-solid bg-clip-border">
                                <div
                                    className="relative overflow-hidden rounded-md"
                                    style={{
                                        backgroundImage: "url('/curved14.jpg')"
                                    }}
                                >
                                    <span className="absolute top-0 left-0 w-full bg-center bg-cover bg-gradient-to-tl from-gray-900 to-slate-800 opacity-80"></span>
                                    <div className="relative p-4">
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
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="mb-0 leading-normal text-white text-sm opacity-80">
                                                    Account Name
                                                </p>
                                                <h6 className="mb-0 text-white text-sm">
                                                    {account.name}
                                                </h6>
                                            </div>
                                            <div>
                                                <p className="mb-0 leading-normal text-white text-sm opacity-80">
                                                    Balance
                                                </p>
                                                <h6 className="mb-0 text-white text-sm">
                                                    {formatCurrency(account.balance || 0, { currency: account.currency })}
                                                </h6>
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

            {/* Total Balance Card */}
            <Card className="border-none drop-shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Your Balance</p>
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