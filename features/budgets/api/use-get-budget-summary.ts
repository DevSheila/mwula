import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetBudgetSummary = () => {
  const query = useQuery({
    queryKey: ["budgets", "summary"],
    queryFn: async () => {
      const response = await client.api.budgets.summary.$get();

      if (!response.ok) throw new Error("Failed to fetch budget summary.");

      const { data } = await response.json();

      return data.map((budget) => ({
        ...budget,
        amount: convertAmountFromMiliunits(budget.amount),
        spent: convertAmountFromMiliunits(budget.spent),
        remaining: convertAmountFromMiliunits(budget.amount - budget.spent),
        progress: (budget.spent / budget.amount) * 100,
      }));
    },
  });

  return query;
}; 