import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { differenceInDays, parse, subDays } from "date-fns";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";
import { sendTransactionSummaryEmail } from "@/lib/email";
import { calculatePercentageChange } from "@/lib/utils";
import { triggerMonthlySummaryEmail, triggerWeeklySummaryEmail } from "@/lib/inngest/triggers";

const app = new Hono()
  .post(
    "/send-summary",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        accountId: z.string().optional(),
        frequency: z.enum(["weekly", "monthly"]).default("monthly"),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { accountId, frequency } = ctx.req.valid("json");

      if (!auth?.userId || !auth?.sessionClaims?.email) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      try {
        if (frequency === "weekly") {
          await triggerWeeklySummaryEmail({
            userId: auth.userId,
            email: auth.sessionClaims.email as string,
            firstName: auth.sessionClaims.firstName as string,
            accountId,
          });
        } else {
          await triggerMonthlySummaryEmail({
            userId: auth.userId,
            email: auth.sessionClaims.email as string,
            firstName: auth.sessionClaims.firstName as string,
            accountId,
          });
        }

        return ctx.json({
          message: `${frequency === "weekly" ? "Weekly" : "Monthly"} summary email scheduled successfully.`,
        });
      } catch (error) {
        console.error("Failed to schedule email:", error);
        return ctx.json({ error: "Failed to schedule email." }, 500);
      }
    }
  );

export default app; 