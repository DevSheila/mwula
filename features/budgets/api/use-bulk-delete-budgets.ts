import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type DeleteBudgetsInput = {
  ids: string[];
};

export const useBulkDeleteBudgets = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ ids }: DeleteBudgetsInput) => {
      const promises = ids.map((id) =>
        client.api.budgets[":id"].$delete({
          param: { id },
        })
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Budgets deleted.");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to delete budgets.");
    },
  });

  return mutation;
}; 