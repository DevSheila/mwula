import { differenceInDays, parse, subDays } from "date-fns";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";
import { sendTransactionSummaryEmail } from "@/lib/email";
import { calculatePercentageChange, convertAmountFromMiliunits } from "@/lib/utils";
import { inngest } from "./client";

// Function to fetch financial data
async function fetchFinancialData(
  userId: string,
  startDate: Date,
  endDate: Date,
  accountId?: string
) {
  return await db
    .select({
      income:
        sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
          Number
        ),
      expenses:
        sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(
          Number
        ),
      remaining: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(
      and(
        accountId ? eq(transactions.accountId, accountId) : undefined,
        eq(accounts.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    );
}

// Test function that runs every 1 minutes
export const testSummaryEmail = inngest.createFunction(
  { id: "test-summary-email" },
  // { cron: "*/10 * * * *" }, // Run every 10 minutes
  { cron: "* * * * *" }, // Run every 1 minute
  async ({ step }) => {
    // Get test user data from environment variables
    const testUserId = process.env.TEST_USER_ID;
    const testUserEmail = process.env.TEST_USER_EMAIL;
    const testUserName = process.env.TEST_USER_NAME;

    if (!testUserId || !testUserEmail) {
      console.log("Test user credentials not found in environment variables");
      return;
    }

    // Calculate date ranges (last 30 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 60); // 30 days ago
    const periodLength = 60; // Last 30 days
    const lastPeriodStart = subDays(startDate, periodLength); // Previous 30-day period
    const lastPeriodEnd = subDays(endDate, periodLength);

    // Fetch current and previous period data
    const [currentPeriod] = await step.run("fetch-current-period", () =>
      fetchFinancialData(testUserId, startDate, endDate)
    );

    const [lastPeriod] = await step.run("fetch-last-period", () =>
      fetchFinancialData(testUserId, lastPeriodStart, lastPeriodEnd)
    );

    // Calculate changes
    const incomeChange = calculatePercentageChange(
      currentPeriod.income || 0,
      lastPeriod.income || 0
    );

    const expensesChange = calculatePercentageChange(
      currentPeriod.expenses || 0,
      lastPeriod.expenses || 0
    );

    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining || 0,
      lastPeriod.remaining || 0
    );

    // Fetch spending categories
    const category = await step.run("fetch-categories", async () =>
      db
        .select({
          name: categories.name,
          value: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(accounts.userId, testUserId),
            lt(transactions.amount, 0),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .groupBy(categories.name)
        .orderBy(desc(sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`))
    );

    const topCategories = category.slice(0, 3).map(cat => ({
      ...cat,
      value: convertAmountFromMiliunits(cat.value)
    }));
    const otherCategories = category.slice(3);
    const otherSum = convertAmountFromMiliunits(
      otherCategories.reduce((sum, current) => sum + current.value, 0)
    );

    const finalCategories = topCategories;
    if (otherCategories.length > 0) {
      finalCategories.push({ name: "Other", value: otherSum });
    }

    // Send test email
    const result = await step.run("send-test-email", () =>
      sendTransactionSummaryEmail({
        to: testUserEmail,
        userName: testUserName || "Test User",
        remainingAmount: convertAmountFromMiliunits(currentPeriod.remaining || 0),
        remainingChange: Math.round(remainingChange * 10) / 10, // Round to 1 decimal place
        incomeAmount: convertAmountFromMiliunits(currentPeriod.income || 0),
        incomeChange: Math.round(incomeChange * 10) / 10, // Round to 1 decimal place
        expensesAmount: -convertAmountFromMiliunits(currentPeriod.expenses || 0),
        expensesChange: Math.round(-expensesChange * 10) / 10, // Negate and round to 1 decimal place
        categories: finalCategories,
        startDate,
        endDate,
      })
    );

    return {
      message: "Test email sent",
      success: result.success,
      timestamp: new Date().toISOString(),
    };
  }
);

// Send Monthly Summary Email Function
export const sendMonthlySummaryEmail = inngest.createFunction(
  { id: "send-monthly-summary-email" },
  { event: "email/monthly.summary" },
  async ({ event, step }) => {
    const { userId, email, firstName, accountId } = event.data;

    // Calculate date ranges
    const endDate = new Date();
    const startDate = subDays(endDate, 30); // Last 30 days
    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    // Fetch current and previous period data
    const [currentPeriod] = await step.run("fetch-current-period", () =>
      fetchFinancialData(userId, startDate, endDate, accountId)
    );

    const [lastPeriod] = await step.run("fetch-last-period", () =>
      fetchFinancialData(userId, lastPeriodStart, lastPeriodEnd, accountId)
    );

    // Calculate changes
    const incomeChange = calculatePercentageChange(
      currentPeriod.income || 0,
      lastPeriod.income || 0
    );

    const expensesChange = calculatePercentageChange(
      currentPeriod.expenses || 0,
      lastPeriod.expenses || 0
    );

    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining || 0,
      lastPeriod.remaining || 0
    );

    // Fetch spending categories
    const category = await step.run("fetch-categories", async () =>
      db
        .select({
          name: categories.name,
          value: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, userId),
            lt(transactions.amount, 0),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .groupBy(categories.name)
        .orderBy(desc(sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`))
    );

    const topCategories = category.slice(0, 3).map(cat => ({
      ...cat,
      value: convertAmountFromMiliunits(cat.value)
    }));
    const otherCategories = category.slice(3);
    const otherSum = convertAmountFromMiliunits(
      otherCategories.reduce((sum, current) => sum + current.value, 0)
    );

    const finalCategories = topCategories;
    if (otherCategories.length > 0) {
      finalCategories.push({ name: "Other", value: otherSum });
    }

    // Send email
    const result = await step.run("send-email", () =>
      sendTransactionSummaryEmail({
        to: email,
        userName: firstName || "there",
        remainingAmount: convertAmountFromMiliunits(currentPeriod.remaining || 0),
        remainingChange: Math.round(remainingChange * 10) / 10, // Round to 1 decimal place
        incomeAmount: convertAmountFromMiliunits(currentPeriod.income || 0),
        incomeChange: Math.round(incomeChange * 10) / 10, // Round to 1 decimal place
        expensesAmount: -convertAmountFromMiliunits(currentPeriod.expenses || 0),
        expensesChange: Math.round(-expensesChange * 10) / 10, // Negate and round to 1 decimal place
        categories: finalCategories,
        startDate,
        endDate,
      })
    );

    return result;
  }
);

// Send Weekly Summary Email Function
export const sendWeeklySummaryEmail = inngest.createFunction(
  { id: "send-weekly-summary-email" },
  { event: "email/weekly.summary" },
  async ({ event, step }) => {
    const { userId, email, firstName, accountId } = event.data;

    // Calculate date ranges
    const endDate = new Date();
    const startDate = subDays(endDate, 7); // Last 7 days
    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    // Fetch current and previous period data
    const [currentPeriod] = await step.run("fetch-current-period", () =>
      fetchFinancialData(userId, startDate, endDate, accountId)
    );

    const [lastPeriod] = await step.run("fetch-last-period", () =>
      fetchFinancialData(userId, lastPeriodStart, lastPeriodEnd, accountId)
    );

    // Calculate changes
    const incomeChange = calculatePercentageChange(
      currentPeriod.income || 0,
      lastPeriod.income || 0
    );

    const expensesChange = calculatePercentageChange(
      currentPeriod.expenses || 0,
      lastPeriod.expenses || 0
    );

    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining || 0,
      lastPeriod.remaining || 0
    );

    // Fetch spending categories
    const category = await step.run("fetch-categories", async () =>
      db
        .select({
          name: categories.name,
          value: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, userId),
            lt(transactions.amount, 0),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .groupBy(categories.name)
        .orderBy(desc(sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`))
    );

    const topCategories = category.slice(0, 3).map(cat => ({
      ...cat,
      value: convertAmountFromMiliunits(cat.value)
    }));
    const otherCategories = category.slice(3);
    const otherSum = convertAmountFromMiliunits(
      otherCategories.reduce((sum, current) => sum + current.value, 0)
    );

    const finalCategories = topCategories;
    if (otherCategories.length > 0) {
      finalCategories.push({ name: "Other", value: otherSum });
    }

    // Send email
    const result = await step.run("send-email", () =>
      sendTransactionSummaryEmail({
        to: email,
        userName: firstName || "there",
        remainingAmount: convertAmountFromMiliunits(currentPeriod.remaining || 0),
        remainingChange: Math.round(remainingChange * 10) / 10, // Round to 1 decimal place
        incomeAmount: convertAmountFromMiliunits(currentPeriod.income || 0),
        incomeChange: Math.round(incomeChange * 10) / 10, // Round to 1 decimal place
        expensesAmount: -convertAmountFromMiliunits(currentPeriod.expenses || 0),
        expensesChange: Math.round(-expensesChange * 10) / 10, // Negate and round to 1 decimal place
        categories: finalCategories,
        startDate,
        endDate,
      })
    );

    return result;
  }
);
