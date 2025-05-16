import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, gte, lte, sql, lt } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { budgets, categories, insertBudgetSchema, transactions, accounts } from "@/db/schema";

const app = new Hono()
  .get(
    "/",
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const data = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          amount: budgets.amount,
          period: budgets.period,
          startDate: budgets.startDate,
          endDate: budgets.endDate,
          category: categories.name,
          categoryId: budgets.categoryId,
        })
        .from(budgets)
        .leftJoin(categories, eq(budgets.categoryId, categories.id))
        .where(eq(budgets.userId, auth.userId))
        .orderBy(desc(budgets.createdAt));

      return ctx.json({ data });
    }
  )
  .get(
    "/summary",
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const currentDate = new Date();

      // Helper function to get period start and end dates
      const getPeriodDates = (budget: typeof budgets.$inferSelect) => {
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        
        switch (budget.period) {
          case "monthly": {
            // Get first and last day of current month
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            return { firstDay, lastDay };
          }
          case "weekly": {
            // Get first and last day of current week (Monday-Sunday)
            const firstDay = new Date(currentDate);
            firstDay.setDate(currentDate.getDate() - currentDate.getDay() + 1);
            const lastDay = new Date(firstDay);
            lastDay.setDate(firstDay.getDate() + 6);
            return { firstDay, lastDay };
          }
          case "yearly": {
            // Get first and last day of current year
            const firstDay = new Date(currentDate.getFullYear(), 0, 1);
            const lastDay = new Date(currentDate.getFullYear(), 11, 31);
            return { firstDay, lastDay };
          }
          default:
            return { firstDay: startDate, lastDay: endDate };
        }
      };

      // Get all budgets for the user
      const userBudgets = await db
        .select()
        .from(budgets)
        .where(eq(budgets.userId, auth.userId));

      // Calculate period dates for each budget
      const budgetPeriods = userBudgets.map(budget => ({
        ...budget,
        ...getPeriodDates(budget)
      }));

      // Get summary with actual spending for each budget
      const data = await Promise.all(
        budgetPeriods.map(async (budget) => {
          // Get total spending for this budget's category within its period
          const [spendingResult] = await db
            .select({
              spent: sql<number>`COALESCE(SUM(
                CASE 
                  WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount})  -- Convert negative amounts to positive
                  ELSE 0  -- Ignore positive amounts as they are income
                END
              ), 0)`.as("spent"),
            })
            .from(transactions)
            .where(
              and(
                budget.categoryId ? eq(transactions.categoryId, budget.categoryId) : undefined,
                gte(transactions.date, budget.firstDay),
                lte(transactions.date, budget.lastDay)
              )
            );

          // Get category name if categoryId exists
          const [category] = budget.categoryId ? await db
            .select()
            .from(categories)
            .where(eq(categories.id, budget.categoryId)) : [];

          const spent = spendingResult?.spent || 0;
          const remaining = budget.amount - spent;
          const progress = (spent / budget.amount) * 100;

          return {
            id: budget.id,
            name: budget.name,
            categoryId: budget.categoryId,
            category: category?.name,
            amount: budget.amount,
            period: budget.period,
            startDate: budget.startDate,
            endDate: budget.endDate,
            spent,
            remaining,
            progress: Math.min(progress, 100), // Cap at 100% for display purposes
            periodStart: budget.firstDay,
            periodEnd: budget.lastDay,
          };
        })
      );

      return ctx.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          amount: budgets.amount,
          period: budgets.period,
          startDate: budgets.startDate,
          endDate: budgets.endDate,
          categoryId: budgets.categoryId,
        })
        .from(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)));

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  )
  .get(
    "/:id/transactions",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      // First get the budget to check ownership and get details
      const [budget] = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)));

      if (!budget) {
        return ctx.json({ error: "Not found." }, 404);
      }

      // Get transactions for this budget's category within its period
      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          isUniversal: categories.isUniversal,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          account: accounts.name,
          accountId: transactions.accountId,
          currency: accounts.currency,
          institutionName: accounts.institutionName,
          accountNumber: accounts.accountNumber,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            budget.categoryId ? eq(transactions.categoryId, budget.categoryId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, budget.startDate),
            lte(transactions.date, budget.endDate),
            // Only include expenses (negative amounts)
            lt(transactions.amount, 0)
          )
        )
        .orderBy(desc(transactions.date));

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertBudgetSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .insert(budgets)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return ctx.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      "json",
      insertBudgetSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .update(budgets)
        .set(values)
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)))
        .returning();

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .delete(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)))
        .returning();

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  );

export default app; 