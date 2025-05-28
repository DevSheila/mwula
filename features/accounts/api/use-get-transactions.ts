import { useQuery } from "@tanstack/react-query";

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

interface GetTransactionsParams {
    accountId?: string;
    from?: string;
    to?: string;
}

async function getTransactions(params: GetTransactionsParams) {
    const searchParams = new URLSearchParams();
    
    if (params.accountId) {
        searchParams.append("accountId", params.accountId);
    }
    if (params.from) {
        searchParams.append("from", params.from);
    }
    if (params.to) {
        searchParams.append("to", params.to);
    }

    const response = await fetch(`/api/transactions?${searchParams.toString()}`);
    
    if (!response.ok) {
        throw new Error("Failed to fetch transactions");
    }

    const data = await response.json();
    return data.data as Transaction[];
}

export function useGetTransactions(params: GetTransactionsParams = {}) {
    return useQuery({
        queryKey: ["transactions", params],
        queryFn: () => getTransactions(params),
    });
} 