import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { sendMonthlySummaryEmail, sendWeeklySummaryEmail, testSummaryEmail } from "@/lib/inngest/function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendMonthlySummaryEmail,
    sendWeeklySummaryEmail,
    testSummaryEmail,
  ],
});



// import { NextResponse } from 'next/server';

// export async function GET() {
// return NextResponse.json({ message: 'Hello World' });
// }