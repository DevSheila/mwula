// import { db } from "@/db/drizzle";
import { categories } from "../db/schema";
import { transactionCategories } from "../lib/transaction-categories";
import { v4 as uuidv4 } from "uuid";

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";


config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function seedUniversalCategories() {
  console.log("Seeding universal categories...");
  
  for (const category of transactionCategories) {
    await db.insert(categories).values({
      id: uuidv4(),
      name: category.title,
      description: category.description,
      icon: category.icon,
      isUniversal: 1,
      // userId is null for universal categories
    }).onConflictDoNothing();
  }
  
  console.log("Universal categories seeded successfully!");
} 

seedUniversalCategories();