
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

    return (
        <div >
            {/* Account Cards */}
            <ScrollArea className="whitespace-nowrap ">
                <div className="flex flex-nowrap gap-4 px-3">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="w-72  mb-4"
                        >
                            <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 border-transparent border-solid  rounded-2xl bg-clip-border">
                                <div
                                    className="relative overflow-hidden rounded-md"
                                    style={{
                                        backgroundImage: "url('/curved14.jpg')"
                                    }}
                                >
                                    <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-gray-900 to-slate-800 opacity-80"></span>
                                    <div className="relative z-10 flex-auto p-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-white font-semibold">
                                                {account.institutionName}
                                            </h4>
                                            <p className="text-white text-sm opacity-80">
                                                {account.currency}
                                            </p>
                                        </div>
                                        <h5 className="pb-2 mt-6 mb-12 text-white text-sm">
                                            {account.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
                                        </h5>
                                        <div className="flex justify-between items-end">
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
                                                    {formatCurrency(account.balance || 0)}
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
            <Card className="border-none bg-white/50 backdrop-blur-sm mb-4">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Balance</p>
                            <h2 className="text-lg font-bold">{formatCurrency(totalBalance)}</h2>
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