import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { subDays } from "date-fns";

import { db } from "@/db/drizzle";
import { accounts, transactions } from "@/db/schema";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        lookbackDays: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { lookbackDays = "365" } = ctx.req.valid("query");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const startDate = subDays(new Date(), parseInt(lookbackDays));

      // This CTE finds groups of transactions with the same payee and similar amounts
      const recurringGroups = db.$with("recurring_groups").as(
        db
          .select({
            payee: transactions.payee,
            amount: transactions.amount,
            transactionCount: sql<number>`count(*)`.as("transaction_count"),
            firstDate: sql<Date>`min(${transactions.date})`.as("first_date"),
            lastDate: sql<Date>`max(${transactions.date})`.as("last_date"),
            avgDaysBetween: sql<number>`
              extract(epoch from (max(${transactions.date}) - min(${transactions.date}))) / 86400 / (count(*) - 1)
            `.as("avg_days_between"),
            stdDevDays: sql<number>`
              stddev(
                extract(epoch from (${transactions.date} - lag(${transactions.date}) over (partition by ${transactions.payee} order by ${transactions.date}))) / 86400
              )
            `.as("std_dev_days")
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              eq(accounts.userId, auth.userId),
              sql`${transactions.date} >= ${startDate}`
            )
          )
          .groupBy(transactions.payee, transactions.amount)
          .having(sql`count(*) >= 3`) // At least 3 occurrences to be considered recurring
      );

      const data = await db
        .with(recurringGroups)
        .select({
          payee: recurringGroups.payee,
          amount: recurringGroups.amount,
          transactionCount: recurringGroups.transactionCount,
          firstDate: recurringGroups.firstDate,
          lastDate: recurringGroups.lastDate,
          avgDaysBetween: recurringGroups.avgDaysBetween,
          stdDevDays: recurringGroups.stdDevDays,
          period: sql<string>`
            CASE 
              WHEN avg_days_between BETWEEN 6 AND 8 THEN 'weekly'
              WHEN avg_days_between BETWEEN 13 AND 15 THEN 'bi-weekly'
              WHEN avg_days_between BETWEEN 28 AND 31 THEN 'monthly'
              WHEN avg_days_between BETWEEN 89 AND 92 THEN 'quarterly'
              WHEN avg_days_between BETWEEN 350 AND 380 THEN 'yearly'
              ELSE 'irregular'
            END
          `.as("period"),
          confidence: sql<number>`
            CASE 
              WHEN std_dev_days IS NULL THEN 100
              WHEN std_dev_days <= 1 THEN 100
              WHEN std_dev_days <= 2 THEN 90
              WHEN std_dev_days <= 3 THEN 80
              WHEN std_dev_days <= 4 THEN 70
              ELSE 60
            END
          `.as("confidence")
        })
        .from(recurringGroups)
        .where(sql`std_dev_days <= 5`) // Filter out highly irregular patterns
        .orderBy(sql`confidence DESC`);

      return ctx.json({ data });
    }
  );

export default app; 