import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useSendSummaryEmail = () => {
  const mutation = useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      accountId,
    }: {
      startDate: string;
      endDate: string;
      accountId?: string;
    }) => {
      const response = await client.api.email["send-summary"].$post({
        json: {
          startDate,
          endDate,
          accountId,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success("Summary email sent successfully");
    },
    onError: () => {
      toast.error("Failed to send summary email");
    },
  });

  return mutation;
}; 