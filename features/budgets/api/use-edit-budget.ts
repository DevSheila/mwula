import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.budgets)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.budgets)[":id"]["$patch"]
>["json"];

export const useEditBudget = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.budgets[":id"]["$patch"]({
        json,
        param: { id },
      });

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Budget updated.");
      queryClient.invalidateQueries({ queryKey: ["budget", { id }] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to edit budget.");
    },
  });

  return mutation;
}; 