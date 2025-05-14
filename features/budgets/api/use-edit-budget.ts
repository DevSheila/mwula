import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";
import { convertAmountToMiliunits } from "@/lib/utils";

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
        json: {
          ...json,
          amount: convertAmountToMiliunits(parseFloat(json.amount as string)),
        },
        param: { id },
      });

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Budget updated.");
      queryClient.invalidateQueries({ queryKey: ["budget", { id }] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast.error("Failed to edit budget.");
    },
  });

  return mutation;
}; 