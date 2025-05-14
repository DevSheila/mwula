-- Drop existing foreign key constraints first
DO $$ BEGIN
    ALTER TABLE "budgets" DROP CONSTRAINT IF EXISTS "budgets_category_id_categories_id_fk";
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Drop the existing budgets table
DROP TABLE IF EXISTS "budgets";

-- Recreate budgets table with enum constraint
CREATE TABLE IF NOT EXISTS "budgets" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "name" text,
    "category_id" text,
    "amount" bigint NOT NULL,
    "period" text NOT NULL CHECK ("period" IN ('monthly', 'weekly', 'yearly')),
    "start_date" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Recreate the foreign key constraint
DO $$ BEGIN
    ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" 
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") 
    ON DELETE set null ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 