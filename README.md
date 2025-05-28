# Finance Platform

Welcome to my Finance Platform project! This platform is designed to help you manage your personal or business finances effectively. With this Finance SaaS Platform, you can track your income and expenses, categorize transactions, assign them to specific accounts, and import transactions using a CSV file. Additionally, it integrates with Plaid to connect to your bank account and uses Lemon Squeezy for monetization.

## Features

- **Track Income and Expenses:** Monitor your financial transactions with ease.
- **Categorize Transactions:** Organize your transactions by categories for better clarity.
- **Account Management:** Assign transactions to specific accounts.
- **CSV Import:** Import transactions from CSV files for quick data entry.
- **Bank Integration:** Connect to your bank account using Plaid.
- **Monetization:** Monetize your platform using Lemon Squeezy.

## Tech Stack

- **Frontend:** Next.js, React
- **Backend:** Hono.js
- **CSV Upload:** Integrated CSV upload functionality
- **Database:** PostgreSQL
- **Bank Integration:** Plaid
- **Payment Processing:** Lemon Squeezy

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/devsheila/<repository_name>.git
   cd <repository_name>
   ```

2. **Install dependencies:**

   ```bash
   # For backend
   cd backend
   npm install

   # For frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following:

   ```env
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key
   DATABASE_URL=your_postgresql_database_url
   ```

4. **Run the application:**

   ```bash
   # For backend
   cd backend
   npm start

   # For frontend
   cd ../frontend
   npm start
   ```

## Usage

1. **Track Income and Expenses:**

   - Add your income and expense transactions manually or import them from a CSV file.

2. **Categorize Transactions:**

   - Assign categories to your transactions for better organization.

3. **Account Management:**

   - Create and manage different accounts, assigning transactions to the appropriate accounts.

4. **CSV Import:**

   - Import transactions using a CSV file by navigating to the import section and uploading your file.

5. **Bank Integration:**

   - Connect your bank account using Plaid to automatically import and sync transactions.

6. **Monetization:**
   - Monetize your platform by integrating Lemon Squeezy for payment processing.


1. **Database Schema (`db/schema.ts`)**
- Added `budgets` table with fields for name, amount, category, dates, and recurring settings
- Created relationships with categories table
- Added Zod schema for validation

2. **Page Component (`app/budgets/page.tsx`)**
- Created a new page for budgets management
- Implements the layout pattern used in other pages
- Includes the BudgetForm and BudgetsList components

3. **Form Component (`app/budgets/components/budget-form.tsx`)**
- Uses React Hook Form for form management
- Implements shadcn/ui components for consistent UI
- Handles budget creation with proper validation
- Supports recurring budgets with period selection
- Uses TanStack Query for cache invalidation

4. **List Component (`app/budgets/components/budgets-list.tsx`)**
- Uses TanStack Table for data display
- Implements sorting, filtering, and pagination
- Shows budget progress with visual indicators
- Formats dates and currency values
- Displays recurring status with badges

5. **Custom Hook (`app/budgets/hooks/use-budgets.ts`)**
- Implements TanStack Query for data fetching
- Handles loading and error states
- Provides caching and auto-refresh functionality

6. **API Routes (`app/api/budgets/route.ts`)**
- Implements GET and POST endpoints
- Uses Drizzle ORM for database operations
- Includes proper error handling
- Calculates budget progress based on transactions
- Implements authentication checks

**Key Features:**
1. Create and manage budgets with names and amounts
2. Associate budgets with expense categories
3. Set date ranges for budgets
4. Support for recurring budgets (monthly, quarterly, yearly)
5. Visual progress tracking
6. Sorting and filtering capabilities
7. Responsive design
8. Real-time updates with TanStack Query

**Used Patterns:**
1. React Hook Form for form management
2. TanStack Query for server state management
3. TanStack Table for data display
4. Drizzle ORM for database operations
5. Shadcn/ui components for consistent UI
6. Custom hooks for reusable logic
7. API routes for data operations
8. Authentication with Clerk
9. Progressive loading states
10. Error handling and user feedback

The feature is now ready to use. Users can:
1. View all their budgets in a table
2. Create new budgets
3. Track spending progress against budgets
4. Filter and sort budgets
5. Set up recurring budgets


