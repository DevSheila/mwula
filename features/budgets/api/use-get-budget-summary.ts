import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export type BudgetSummary = {
  id: string;
  name: string | null;
  categoryId: string | null;
  category: string | null;
  amount: number;
  spent: number;
  remaining: number;
  progress: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  endDate: string;
  periodStart: string;
  periodEnd: string;
  categories: Array<{ id: string; name: string }>;
};

export const useGetBudgetSummary = () => {
  const query = useQuery<BudgetSummary[]>({
    queryKey: ["budgets", "summary"],
    queryFn: async () => {
      const response = await client.api.budgets.summary.$get();

      if (!response.ok) throw new Error("Failed to fetch budget summary.");

      const { data } = await response.json();

      return data.map((budget: any) => ({
        ...budget,
        amount: convertAmountFromMiliunits(budget.amount),
        spent: convertAmountFromMiliunits(budget.spent),
        remaining: convertAmountFromMiliunits(budget.amount - budget.spent),
        progress: Math.min(Math.max((budget.spent / budget.amount) * 100, 0), 100),
        categories: budget.categories || [],
      }));
    },
  });

  return query;
}; 