import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { budgets, categories, insertBudgetSchema } from "@/db/schema";

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    try {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      console.log('Fetching budgets for user:', auth.userId);
      
      // First get all budgets for the user
      const budgetData = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          amount: budgets.amount,
          startDate: budgets.startDate,
          endDate: budgets.endDate,
          isRecurring: budgets.isRecurring,
          recurringPeriod: budgets.recurringPeriod,
          categoryId: budgets.categoryId,
        })
        .from(budgets)
        .where(eq(budgets.userId, auth.userId))
        .orderBy(desc(budgets.startDate));

      console.log('Found budgets:', budgetData.length);

      if (budgetData.length > 0) {
        // Then get categories for those budgets
        const categoryIds = Array.from(new Set(budgetData.map(b => b.categoryId)));
        console.log('Fetching categories for IDs:', categoryIds);
        
        const categoriesData = await db
          .select({
            id: categories.id,
            name: categories.name,
          })
          .from(categories)
          .where(
            and(
              eq(categories.userId, auth.userId),
              inArray(categories.id, categoryIds)
            )
          );

        console.log('Found categories:', categoriesData.length);

        // Create a map of category names
        const categoryMap = new Map(categoriesData.map(c => [c.id, c.name]));

        // Combine the data
        const data = budgetData.map(budget => ({
          ...budget,
          spent: 0, // Add default spent value
          category: categoryMap.get(budget.categoryId) || 'Unknown Category',
        }));

        return ctx.json({ data });
      } else {
        // Return empty array if no budgets found
        return ctx.json({ data: [] });
      }
    } catch (error: any) {
      console.error('Error fetching budgets:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
      return ctx.json({ error: "Failed to fetch budgets." }, 500);
    }
  })
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .select()
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
    zValidator("json", insertBudgetSchema.omit({ id: true, userId: true })),
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
          spent: 0,
          ...values,
        })
        .returning();

      return ctx.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", insertBudgetSchema.omit({ id: true })),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

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
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

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