"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

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

    // Get the first two accounts to display as cards
    const displayAccounts = accounts.slice(0, 2);

    return (
    <>
        <div className="max-w-full px-3 lg:w-1/3 lg:flex-none">
            <div className="flex flex-wrap -mx-3">
                <div className="w-full max-w-full px-3 mb-4 xl:mb-0  xl:flex-none">
                    <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 border-transparent border-solid shadow-xl rounded-2xl bg-clip-border">
                        <div className="relative overflow-hidden rounded-2xl"
                            style={{
                                backgroundImage: "url('/curved14.jpg')"
                            }}
                        >
                            <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-gray-900 to-slate-800 opacity-80"></span>
                            <div className="relative z-10 flex-auto p-4">
                                <i className="p-2 text-white fas fa-wifi"></i>
                                <h5 className="pb-2 mt-6 mb-12 text-white">4562&nbsp;&nbsp;&nbsp;1122&nbsp;&nbsp;&nbsp;4594&nbsp;&nbsp;&nbsp;7852</h5>
                                <div className="flex">
                                    <div className="flex">
                                        <div className="mr-6">
                                            <p className="mb-0 leading-normal text-white text-sm opacity-80">Card Holder</p>
                                            <h6 className="mb-0 text-white">Jack Peterson</h6>
                                        </div>
                                        <div>
                                            <p className="mb-0 leading-normal text-white text-sm opacity-80">Expires</p>
                                            <h6 className="mb-0 text-white">11/22</h6>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-end w-1/5 ml-auto">
                                        <img className="w-3/5 mt-2" src="/logos/mastercard.png" alt="logo" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-none bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Your Balance</p>
                            <h2 className="text-2xl font-bold">{formatCurrency(totalBalance)}</h2>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">+23.65%</p>
                                <p className="text-xs text-muted-foreground">Increase</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-rose-600">-10.40%</p>
                                <p className="text-xs text-muted-foreground">Decrease</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Currency</p>
                                <p className="text-sm font-medium">USD / US Dollar</p>
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
                className="w-full border-dashed"
            >
                <Plus className="mr-2 size-4" />
                Add New Card
            </Button>
        </div>
    </>
    );
}; 