import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export type Transaction = {
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
};

export type TransactionResponse = {
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};

export const useGetTransactions = () => {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const accountId = searchParams.get("accountId") || "";
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "10";

  const query = useQuery({
    queryKey: ["transactions", { from, to, accountId, page, pageSize }],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: {
          from,
          to,
          accountId,
          page,
          pageSize,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch transactions.");

      const { data, pagination } = await response.json() as TransactionResponse;

      // Transform the data to ensure null values instead of undefined
      const transformedData = data.map((transaction) => ({
        ...transaction,
        amount: convertAmountFromMiliunits(transaction.amount),
        category: transaction.category || null,
        categoryId: transaction.categoryId || null,
        isUniversal: transaction.isUniversal || null,
        notes: transaction.notes || null
      }));

      return {
        data: transformedData,
        pagination,
      };
    },
  });

  return query;
};