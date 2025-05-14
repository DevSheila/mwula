import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { budgets, categories, insertBudgetSchema, transactions } from "@/db/schema";

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
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

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
          spent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.as("spent"),
        })
        .from(budgets)
        .leftJoin(categories, eq(budgets.categoryId, categories.id))
        .leftJoin(
          transactions,
          and(
            eq(transactions.categoryId, budgets.categoryId),
            gte(transactions.date, firstDayOfMonth),
            lte(transactions.date, lastDayOfMonth),
            sql`${transactions.amount} > 0`
          )
        )
        .where(eq(budgets.userId, auth.userId))
        .groupBy(
          budgets.id,
          budgets.name,
          budgets.amount,
          budgets.period,
          budgets.startDate,
          budgets.endDate,
          categories.name,
          budgets.categoryId
        )
        .orderBy(desc(budgets.createdAt));

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