import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetRecurringTransactions = (lookbackDays?: string) => {
  const query = useQuery({
    queryKey: ["recurring-transactions", { lookbackDays }],
    queryFn: async () => {
      const response = await client.api["recurring-transactions"].$get({
        query: {
          lookbackDays,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch recurring transactions.");

      const { data } = await response.json();

      return data.map((transaction: any) => ({
        ...transaction,
        amount: convertAmountFromMiliunits(transaction.amount),
      }));
    },
  });

  return query;
}; 