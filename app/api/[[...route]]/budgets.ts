import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, gte, lte, sql, lt, inArray, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { budgets, categories, insertBudgetSchema, transactions, accounts, budgetCategories } from "@/db/schema";

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
          categories: sql<{ id: string; name: string }[]>`
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ${categories.id},
                  'name', ${categories.name}
                )
              ) FILTER (WHERE ${categories.id} IS NOT NULL),
              '[]'::json
            )
          `.as('categories'),
        })
        .from(budgets)
        .leftJoin(
          budgetCategories,
          eq(budgets.id, budgetCategories.budgetId)
        )
        .leftJoin(
          categories,
          eq(budgetCategories.categoryId, categories.id)
        )
        .where(eq(budgets.userId, auth.userId))
        .groupBy(budgets.id);

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

      try {
        // First get all budgets with their categories
        const userBudgets = await db
          .select({
            id: budgets.id,
            name: budgets.name,
            amount: budgets.amount,
            period: budgets.period,
            startDate: budgets.startDate,
            endDate: budgets.endDate,
            categories: sql<{ id: string; name: string }[]>`
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', ${categories.id},
                    'name', ${categories.name}
                  )
                ) FILTER (WHERE ${categories.id} IS NOT NULL),
                '[]'::json
              )
            `.as('categories'),
          })
          .from(budgets)
          .leftJoin(
            budgetCategories,
            eq(budgets.id, budgetCategories.budgetId)
          )
          .leftJoin(
            categories,
            eq(budgetCategories.categoryId, categories.id)
          )
          .where(eq(budgets.userId, auth.userId))
          .groupBy(budgets.id);

        // Then calculate spending for each budget
        const data = await Promise.all(
          userBudgets.map(async (budget) => {
            const categoryIds = budget.categories.map(c => c.id);

            // Get total spending for this budget's categories within its period
            const [spendingResult] = await db
              .select({
                spent: sql<number>`COALESCE(SUM(
                  CASE 
                    WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount})
                    ELSE 0
                  END
                ), 0)`.as("spent"),
              })
              .from(transactions)
              .innerJoin(
                accounts,
                eq(transactions.accountId, accounts.id)
              )
              .where(
                and(
                  eq(accounts.userId, auth.userId),
                  categoryIds.length > 0
                    ? inArray(transactions.categoryId, categoryIds)
                    : undefined,
                  gte(transactions.date, budget.startDate),
                  lte(transactions.date, budget.endDate)
                )
              );

            const spent = spendingResult?.spent || 0;
            const remaining = budget.amount - spent;
            const progress = (spent / budget.amount) * 100;

            return {
              ...budget,
              spent,
              remaining,
              progress: Math.min(progress, 100),
            };
          })
        );

        return ctx.json({ data });
      } catch (error) {
        console.error('Error fetching budget summary:', error);
        return ctx.json({ 
          error: "Failed to fetch budget summary.",
          details: error instanceof Error ? error.message : String(error)
        }, 500);
      }
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
          categories: sql<{ id: string; name: string }[]>`
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ${categories.id},
                  'name', ${categories.name}
                )
              ) FILTER (WHERE ${categories.id} IS NOT NULL),
              '[]'::json
            )
          `.as('categories'),
        })
        .from(budgets)
        .leftJoin(
          budgetCategories,
          eq(budgets.id, budgetCategories.budgetId)
        )
        .leftJoin(
          categories,
          eq(budgetCategories.categoryId, categories.id)
        )
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)))
        .groupBy(budgets.id);

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

      // First get the budget and its categories to check ownership and get details
      const [budget] = await db
        .select({
          id: budgets.id,
          startDate: budgets.startDate,
          endDate: budgets.endDate,
          categories: sql<{ id: string; name: string }[]>`
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ${categories.id},
                  'name', ${categories.name}
                )
              ) FILTER (WHERE ${categories.id} IS NOT NULL),
              '[]'::json
            )
          `.as('categories'),
        })
        .from(budgets)
        .leftJoin(
          budgetCategories,
          eq(budgets.id, budgetCategories.budgetId)
        )
        .leftJoin(
          categories,
          eq(budgetCategories.categoryId, categories.id)
        )
        .where(and(eq(budgets.id, id), eq(budgets.userId, auth.userId)))
        .groupBy(budgets.id);

      if (!budget) {
        return ctx.json({ error: "Not found." }, 404);
      }

      const categoryIds = budget.categories.map(c => c.id);

      // Get transactions for this budget's categories within its period
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
            eq(accounts.userId, auth.userId),
            categoryIds.length > 0
              ? inArray(transactions.categoryId, categoryIds)
              : undefined,
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
      z.object({
        name: z.string().optional(),
        amount: z.number(),
        categoryIds: z.array(z.string()).min(1),
        period: z.enum(["monthly", "weekly", "yearly"]),
        startDate: z.string(),
        endDate: z.string(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { categoryIds, startDate, endDate, ...values } = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      try {
        const newBudgetId = createId();

        // Verify categories exist before creating budget
        const existingCategories = await db
          .select({ id: categories.id })
          .from(categories)
          .where(
            and(
              inArray(categories.id, categoryIds),
              or(
                eq(categories.userId, auth.userId),
                eq(categories.isUniversal, 1)
              )
            )
          );

        if (existingCategories.length !== categoryIds.length) {
          return ctx.json({ error: "One or more categories not found or not accessible." }, 400);
        }

        // Create the budget first
        const [budget] = await db
          .insert(budgets)
          .values({
            id: newBudgetId,
            userId: auth.userId,
            ...values,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          })
          .returning();

        if (!budget) {
          throw new Error("Failed to create budget");
        }

        // Create budget-category associations
        const budgetCategoryValues = categoryIds.map(categoryId => ({
          id: createId(),
          budgetId: newBudgetId,
          categoryId,
        }));

        await db
          .insert(budgetCategories)
          .values(budgetCategoryValues);

        // Fetch the created budget with its categories
        const [data] = await db
          .select({
            id: budgets.id,
            name: budgets.name,
            amount: budgets.amount,
            period: budgets.period,
            startDate: budgets.startDate,
            endDate: budgets.endDate,
            userId: budgets.userId,
            createdAt: budgets.createdAt,
            updatedAt: budgets.updatedAt,
            categories: sql<{ id: string; name: string }[]>`
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', ${categories.id},
                    'name', ${categories.name}
                  )
                ) FILTER (WHERE ${categories.id} IS NOT NULL),
                '[]'::json
              )
            `.as('categories'),
          })
          .from(budgets)
          .leftJoin(
            budgetCategories,
            eq(budgets.id, budgetCategories.budgetId)
          )
          .leftJoin(
            categories,
            eq(budgetCategories.categoryId, categories.id)
          )
          .where(eq(budgets.id, newBudgetId))
          .groupBy(
            budgets.id,
            budgets.name,
            budgets.amount,
            budgets.period,
            budgets.startDate,
            budgets.endDate,
            budgets.userId,
            budgets.createdAt,
            budgets.updatedAt
          );

        return ctx.json({ data });
      } catch (error) {
        console.error('Error creating budget:', error);
        
        // Try to clean up if budget was created but categories failed
        if (error instanceof Error && error.message !== "Failed to create budget") {
          try {
            await db
              .delete(budgets)
              .where(eq(budgets.id, newBudgetId));
          } catch (cleanupError) {
            console.error('Failed to clean up budget:', cleanupError);
          }
        }

        return ctx.json({ 
          error: "Failed to create budget.",
          details: error instanceof Error ? error.message : String(error)
        }, 500);
      }
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
      z.object({
        name: z.string().optional(),
        amount: z.number(),
        categoryIds: z.array(z.string()).min(1),
        period: z.enum(["monthly", "weekly", "yearly"]),
        startDate: z.string(),
        endDate: z.string(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const { categoryIds, startDate, endDate, ...values } = ctx.req.valid("json");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      try {
        // Verify budget exists and belongs to user
        const [existingBudget] = await db
          .select({
            id: budgets.id,
          })
          .from(budgets)
          .where(
            and(
              eq(budgets.id, id),
              eq(budgets.userId, auth.userId)
            )
          );

        if (!existingBudget) {
          return ctx.json({ error: "Budget not found." }, 404);
        }

        // Verify categories exist and are accessible
        const existingCategories = await db
          .select({ id: categories.id })
          .from(categories)
          .where(
            and(
              inArray(categories.id, categoryIds),
              or(
                eq(categories.userId, auth.userId),
                eq(categories.isUniversal, 1)
              )
            )
          );

        if (existingCategories.length !== categoryIds.length) {
          return ctx.json({ error: "One or more categories not found or not accessible." }, 400);
        }

        // Update budget
        await db
          .update(budgets)
          .set({
            ...values,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          })
          .where(eq(budgets.id, id));

        // Delete existing category associations
        await db
          .delete(budgetCategories)
          .where(eq(budgetCategories.budgetId, id));

        // Create new category associations
        await db
          .insert(budgetCategories)
          .values(
            categoryIds.map(categoryId => ({
              id: createId(),
              budgetId: id,
              categoryId,
            }))
          );

        // Fetch the updated budget with its categories
        const [data] = await db
          .select({
            id: budgets.id,
            name: budgets.name,
            amount: budgets.amount,
            period: budgets.period,
            startDate: budgets.startDate,
            endDate: budgets.endDate,
            userId: budgets.userId,
            createdAt: budgets.createdAt,
            updatedAt: budgets.updatedAt,
            categories: sql<{ id: string; name: string }[]>`
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', ${categories.id},
                    'name', ${categories.name}
                  )
                ) FILTER (WHERE ${categories.id} IS NOT NULL),
                '[]'::json
              )
            `.as('categories'),
          })
          .from(budgets)
          .leftJoin(
            budgetCategories,
            eq(budgets.id, budgetCategories.budgetId)
          )
          .leftJoin(
            categories,
            eq(budgetCategories.categoryId, categories.id)
          )
          .where(eq(budgets.id, id))
          .groupBy(
            budgets.id,
            budgets.name,
            budgets.amount,
            budgets.period,
            budgets.startDate,
            budgets.endDate,
            budgets.userId,
            budgets.createdAt,
            budgets.updatedAt
          );

        return ctx.json({ data });
      } catch (error) {
        console.error('Error updating budget:', error);
        return ctx.json({ 
          error: "Failed to update budget.",
          details: error instanceof Error ? error.message : String(error)
        }, 500);
      }
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