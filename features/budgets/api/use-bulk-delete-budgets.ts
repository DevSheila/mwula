import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type BulkDeleteRequest = {
  ids: string[];
};

export const useBulkDeleteBudgets = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, BulkDeleteRequest>({
    mutationFn: async ({ ids }) => {
      await Promise.all(
        ids.map((id) =>
          client.api.budgets[":id"]["$delete"]({
            param: { id },
          })
        )
      );
    },
    onSuccess: () => {
      toast.success("Budgets deleted.");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast.error("Failed to delete budgets.");
    },
  });

  return mutation;
}; 