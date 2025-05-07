export interface TransactionCategory {
    title: string;
    description: string;
    icon: string;
  }
  
  export const transactionCategories: TransactionCategory[] = [
    {
      title: "Groceries",
      description: "Expenses for food and household items from supermarkets or local markets.",
      icon: "shopping-basket"
    },
    {
      title: "Dining Out",
      description: "Spending on restaurants, cafes, fast food, and takeaways.",
      icon: "pizza"
    },
    {
      title: "Rent",
      description: "Monthly housing or apartment rental payments.",
      icon: "home"
    },
    {
      title: "Utilities",
      description: "Bills for electricity, water, gas, and garbage collection.",
      icon: "plug"
    },
    {
      title: "Internet & Phone",
      description: "Monthly costs for mobile and broadband services.",
      icon: "wifi"
    },
    {
      title: "Transport",
      description: "Expenses on fuel, public transport, taxis, or ride-sharing services.",
      icon: "bus"
    },
    {
      title: "Insurance",
      description: "Premiums for health, auto, home, or life insurance.",
      icon: "shield-check"
    },
    {
      title: "Healthcare",
      description: "Medical consultations, prescriptions, and hospital visits.",
      icon: "stethoscope"
    },
    {
      title: "Education",
      description: "Tuition fees, books, courses, or learning materials.",
      icon: "book"
    },
    {
      title: "Savings",
      description: "Money set aside for savings or investment accounts.",
      icon: "piggy-bank"
    },
    {
      title: "Entertainment",
      description: "Spending on movies, concerts, games, or streaming services.",
      icon: "tv"
    },
    {
      title: "Travel",
      description: "Expenses related to flights, hotels, and vacations.",
      icon: "plane"
    },
    {
      title: "Clothing",
      description: "Spending on clothes, shoes, and accessories.",
      icon: "shirt"
    },
    {
      title: "Personal Care",
      description: "Salon visits, cosmetics, toiletries, and wellness products.",
      icon: "scissors"
    },
    {
      title: "Gifts & Donations",
      description: "Money given as gifts or to charitable causes.",
      icon: "gift"
    },
    {
      title: "Subscriptions",
      description: "Recurring payments for apps, software, and memberships.",
      icon: "repeat"
    },
    {
      title: "Home Maintenance",
      description: "Repairs, renovations, and other household services.",
      icon: "wrench"
    },
    {
      title: "Pets",
      description: "Spending on pet food, grooming, or veterinary care.",
      icon: "paw-print"
    },
    {
      title: "Childcare",
      description: "Daycare, babysitting, or school supplies for children.",
      icon: "baby"
    },
    {
      title: "Investments",
      description: "Purchases of stocks, bonds, crypto, or other assets.",
      icon: "trending-up"
    },
    {
      title: "Loan Payments",
      description: "Monthly repayments on personal, auto, or student loans.",
      icon: "credit-card"
    },
    {
      title: "Income",
      description: "Money received from salary, bonuses, or freelance work.",
      icon: "dollar-sign"
    },
    {
      title: "Tax",
      description: "Income tax, property tax, or any government levies.",
      icon: "file-text"
    },
    {
      title: "Emergency Fund",
      description: "Money saved for unexpected expenses or emergencies.",
      icon: "alert-triangle"
    },
    {
      title: "Miscellaneous",
      description: "Uncategorized or irregular transactions.",
      icon: "more-horizontal"
    }
  ];
  