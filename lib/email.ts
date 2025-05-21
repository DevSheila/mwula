import { Resend } from "resend";
import { TransactionSummaryEmail } from "@/components/emails/TransactionSummary";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTransactionSummaryEmail({
  to,
  userName,
  remainingAmount,
  remainingChange,
  incomeAmount,
  incomeChange,
  expensesAmount,
  expensesChange,
  categories,
  startDate,
  endDate,
}: {
  to: string;
  userName: string;
  remainingAmount: number;
  remainingChange: number;
  incomeAmount: number;
  incomeChange: number;
  expensesAmount: number;
  expensesChange: number;
  categories: Array<{
    name: string;
    value: number;
  }>;
  startDate: Date;
  endDate: Date;
}) {
  try {
    const data = await resend.emails.send({
      // from: "Finance Tracker <noreply@your-domain.com>",
      from: "Finance App <onboarding@resend.dev>",
      to: [to],
      subject: `Your Financial Summary for ${startDate.toLocaleDateString()}`,
      react: TransactionSummaryEmail({
        userName,
        remainingAmount,
        remainingChange,
        incomeAmount,
        incomeChange,
        expensesAmount,
        expensesChange,
        categories,
        startDate,
        endDate,
      }),
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
} 