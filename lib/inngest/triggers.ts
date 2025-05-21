import { inngest } from "./client";

export async function triggerMonthlySummaryEmail({
  userId,
  email,
  firstName,
  accountId,
}: {
  userId: string;
  email: string;
  firstName?: string;
  accountId?: string;
}) {
  return await inngest.send({
    name: "email/monthly.summary",
    data: {
      userId,
      email,
      firstName,
      accountId,
    },
  });
}

export async function triggerWeeklySummaryEmail({
  userId,
  email,
  firstName,
  accountId,
}: {
  userId: string;
  email: string;
  firstName?: string;
  accountId?: string;
}) {
  return await inngest.send({
    name: "email/weekly.summary",
    data: {
      userId,
      email,
      firstName,
      accountId,
    },
  });
} 