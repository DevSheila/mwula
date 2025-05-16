import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetBudgetTransactions = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["budget", { id }, "transactions"],
    queryFn: async () => {
      const response = await client.api.budgets[":id"].transactions.$get({
        param: { id },
      });

      if (!response.ok) throw new Error("Failed to fetch budget transactions.");

      const { data } = await response.json();

      return data.map((transaction: any) => ({
        ...transaction,
        amount: convertAmountFromMiliunits(transaction.amount),
      }));
    },
  });

  return query;
}; 