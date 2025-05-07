export interface TransactionCategory {
  title: string;  description: string; icon: string;
}
export const transactionCategories: TransactionCategory[] = [
    {
      "title": "Salary",
      "description": "Monthly income from employment",
      "icon": "briefcase"
    },
    {
      "title": "Freelance",
      "description": "Earnings from freelance projects",
      "icon": "pen-tool"
    },
    {
      "title": "Investments Income",
      "description": "Income from stocks, bonds, and other investments",
      "icon": "line-chart"
    },
    {
      "title": "Rent Income",
      "description": "Earnings from rental properties",
      "icon": "home"
    },
    {
      "title": "Business Income",
      "description": "Revenue from business operations",
      "icon": "building"
    },
    {
      "title": "Dividends",
      "description": "Earnings from dividends",
      "icon": "dollar-sign"
    },
    {
      "title": "Interest Income",
      "description": "Earnings from interest on savings or loans",
      "icon": "percent"
    },
    {
      "title": "Gifts Received",
      "description": "Monetary gifts received",
      "icon": "gift"
    },
    {
      "title": "Refunds",
      "description": "Money returned from previous expenses",
      "icon": "rotate-ccw"
    },
    {
      "title": "Other Income",
      "description": "Miscellaneous income sources",
      "icon": "coins"
    },
    {
      "title": "Groceries",
      "description": "Expenses on food items",
      "icon": "shopping-cart"
    },
    {
      "title": "Household Supplies",
      "description": "Cleaning products, paper goods, and other household essentials",
      "icon": "shopping-basket"
    },
    {
      "title": "Dining Out",
      "description": "Expenses at restaurants and cafes",
      "icon": "coffee"
    },
    {
      "title": "Utilities",
      "description": "Electricity, water, gas, and other utilities",
      "icon": "plug"
    },
    {
      "title": "Rent",
      "description": "Monthly housing rent payments",
      "icon": "home"
    },
    {
      "title": "Mortgage",
      "description": "Mortgage loan payments",
      "icon": "bank"
    },
    {
      "title": "Home Maintenance",
      "description": "Repairs and upkeep for home",
      "icon": "tools"
    },
    {
      "title": "Home Improvement",
      "description": "Expenses for upgrading or renovating home",
      "icon": "paint-roller"
    },
    {
      "title": "Furniture",
      "description": "Home and office furniture expenses",
      "icon": "sofa"
    },
    {
      "title": "Transportation",
      "description": "Expenses for public transport, ride-sharing, and other general vehicle use",
      "icon": "car"
    },
    {
      "title": "Fuel",
      "description": "Gasoline, diesel, or other vehicle fuel",
      "icon": "fuel"
    },
    {
      "title": "Vehicle Maintenance",
      "description": "Servicing, repairs, and parts for vehicles",
      "icon": "settings-2"
    },
    {
      "title": "Parking",
      "description": "Parking fees and permits",
      "icon": "parking-circle"
    },
    {
      "title": "Tolls",
      "description": "Road and bridge toll expenses",
      "icon": "road"
    },
    {
      "title": "Public Transport",
      "description": "Bus, train, and subway fares",
      "icon": "bus"
    },
    {
      "title": "Taxi",
      "description": "Taxi and ride-sharing services",
      "icon": "car"
    },
    {
      "title": "Internet",
      "description": "Monthly internet service charges",
      "icon": "wifi"
    },
    {
      "title": "Mobile Phone",
      "description": "Mobile phone bills",
      "icon": "smartphone"
    },
    {
      "title": "Airtime",
      "description": "Mobile phone airtime and data top-ups",
      "icon": "smartphone"
    },
    {
      "title": "Cable TV",
      "description": "Cable television subscriptions",
      "icon": "tv"
    },
    {
      "title": "Streaming Services",
      "description": "Online streaming subscriptions (e.g., Netflix, Spotify)",
      "icon": "play-circle"
    },
    {
      "title": "Subscriptions",
      "description": "Recurring subscriptions like magazines, software, or other services",
      "icon": "repeat"
    },
    {
      "title": "Loan Payments",
      "description": "Repayment of general personal or other loans",
      "icon": "dollar-sign"
    },
    {
      "title": "Student Loan",
      "description": "Repayment of student loans",
      "icon": "graduation-cap"
    },
    {
      "title": "Credit Card Payments",
      "description": "Monthly credit card bill payments",
      "icon": "credit-card"
    },
    {
      "title": "Health Insurance",
      "description": "Premiums for health insurance plans",
      "icon": "shield-plus"
    },
    {
      "title": "Auto Insurance",
      "description": "Premiums for vehicle insurance",
      "icon": "shield-check"
    },
    {
      "title": "Other Insurance",
      "description": "Premiums for life, home, or other non-specified types of insurance",
      "icon": "shield"
    },
    {
      "title": "Healthcare",
      "description": "Medical, dental, and vision expenses (not covered by insurance)",
      "icon": "heart"
    },
    {
      "title": "Education",
      "description": "Tuition fees, courses, and educational materials",
      "icon": "book-open"
    },
    {
      "title": "Childcare",
      "description": "Expenses for child care services, babysitting",
      "icon": "baby"
    },
    {
      "title": "Clothing",
      "description": "Apparel and accessories purchases",
      "icon": "shirt"
    },
    {
      "title": "Personal Care",
      "description": "Haircuts, salon, spa, and grooming expenses",
      "icon": "scissors"
    },
    {
      "title": "Pet Care",
      "description": "Expenses for pet food, grooming, and vet visits",
      "icon": "paw"
    },
    {
      "title": "Fitness",
      "description": "Gym memberships and fitness equipment",
      "icon": "dumbbell"
    },
    {
      "title": "Entertainment",
      "description": "General leisure activities, concerts, events (not movies/travel)",
      "icon": "film"
    },
    {
      "title": "Cinema / Theatre",
      "description": "Tickets for movies, plays, and live shows",
      "icon": "film"
    },
    {
      "title": "Travel",
      "description": "General expenses for trips and vacations (not specific airfare/hotel)",
      "icon": "plane"
    },
    {
      "title": "Airfare",
      "description": "Flight ticket purchases",
      "icon": "plane"
    },
    {
      "title": "Hotel",
      "description": "Accommodation expenses during travel",
      "icon": "hotel"
    },
    {
      "title": "Vacation",
      "description": "Overall vacation package or specific vacation fund spending",
      "icon": "umbrella"
    },
    {
      "title": "Books",
      "description": "Purchases of books and e-books",
      "icon": "book"
    },
    {
      "title": "Music",
      "description": "Music album purchases or concert tickets",
      "icon": "music"
    },
    {
      "title": "Games",
      "description": "Video game, board game, or mobile game purchases",
      "icon": "gamepad"
    },
    {
      "title": "Hobbies",
      "description": "Expenses on personal hobbies and related materials",
      "icon": "palette"
    },
    {
      "title": "Taxes",
      "description": "Income, sales, or other general tax payments",
      "icon": "file-text"
    },
    {
      "title": "Property Tax",
      "description": "Taxes paid on real estate property",
      "icon": "landmark"
    },
    {
      "title": "Bank Fees",
      "description": "Charges from banking services (e.g., monthly fees, overdraft)",
      "icon": "credit-card"
    },
    {
      "title": "ATM Fees",
      "description": "Fees for ATM withdrawals",
      "icon": "credit-card"
    },
    {
      "title": "Transfer Fees",
      "description": "Fees incurred for transferring money (e.g., wire transfers)",
      "icon": "arrow-right-left"
    },
    {
      "title": "Late Fees",
      "description": "Penalties for late payments on bills or loans",
      "icon": "alert-triangle"
    },
    {
      "title": "Legal Fees",
      "description": "Expenses for legal services and consultations",
      "icon": "scale"
    },
    {
      "title": "Postage & Shipping",
      "description": "Costs for mailing letters and packages",
      "icon": "mail"
    },
    {
      "title": "Transaction Costs",      
      "description": "Fees associated with making transactions (e.g., brokerage fees, payment processing fees)",
      "icon": "arrow-right-left"
    },
    {
      "title": "Donations",
      "description": "Charitable contributions",
      "icon": "hand-heart"
    },
    {
      "title": "Gifts Given",
      "description": "Money spent on gifts for others",
      "icon": "gift"
    },
    {
      "title": "Electronics",
      "description": "Purchases of electronic devices and gadgets",
      "icon": "smartphone"
    },
    {
      "title": "Software",
      "description": "One-time purchases of software applications or licenses",
      "icon": "app-window"
    },
    {
      "title": "Office Supplies",
      "description": "Stationery and office equipment for personal or work use",
      "icon": "file-text"
    },
    {
      "title": "Snacks",
      "description": "Small food purchases like chips, candy, beverages between meals",
      "icon": "candy"
    },
    {
      "title": "Coffee Shops",
      "description": "Purchases at coffee shops (coffee, tea, pastries)",
      "icon": "coffee"
    },
    {
      "title": "Alcohol",
      "description": "Alcoholic beverages purchases (stores or bars)",
      "icon": "wine"
    },
    {
      "title": "Tobacco",
      "description": "Cigarettes and other tobacco products",
      "icon": "smoking"
    },
    {
      "title": "Lottery & Gambling",
      "description": "Lottery tickets and gambling expenses",
      "icon": "dice"
    },
    {
      "title": "Memberships",
      "description": "Fees for professional organizations, clubs, or other non-fitness/streaming memberships",
      "icon": "award"
    },
    {
      "title": "Other Expenses",
      "description": "Miscellaneous or uncategorized expenses",
      "icon": "more-horizontal"
    },
    {
      "title": "Savings",
      "description": "Money set aside for savings accounts",
      "icon": "piggy-bank"
    },
    {
      "title": "Investments",
      "description": "Money invested in various assets (e.g., stocks, mutual funds)",
      "icon": "trending-up"
    },
    {
      "title": "Emergency Fund",
      "description": "Contributions to an emergency fund",
      "icon": "life-buoy"
    },
    {
      "title": "Retirement Fund",
      "description": "Contributions to retirement accounts (e.g., 401k, IRA)",
      "icon": "calendar"
    },
    {
      "title": "Education Fund",
      "description": "Savings for future education purposes",
      "icon": "book-open"
    },
    {
      "title": "Cash Withdrawal",
      "description": "Withdrawing cash from ATM or bank",
      "icon": "wallet"
    },
    {
      "title": "Wedding",
      "description": "Expenses related to wedding planning and celebration",
      "icon": "heart"
    },
    {
      "title": "Birthday",
      "description": "Birthday celebration expenses and gifts",
      "icon": "gift"
    },
    {
      "title": "Anniversary",
      "description": "Anniversary celebration expenses",
      "icon": "calendar"
    },
    {
      "title": "Holiday",
      "description": "General holiday-related expenses (e.g., decorations, travel)",
      "icon": "snowflake"
    },
    {
      "title": "New Year",
      "description": "New Year celebration expenses",
      "icon": "calendar"
    },
    {
      "title": "Valentine's Day",
      "description": "Valentine's Day expenses",
      "icon": "heart"
    },
    {
      "title": "Easter",
      "description": "Easter celebration expenses",
      "icon": "egg"
    },
    {
      "title": "Thanksgiving",
      "description": "Thanksgiving celebration expenses",
      "icon": "utensils"
    }
  ];