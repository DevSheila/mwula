// financialAccounts.ts

export interface FinancialAccount {
  id: number;
  account_name: string;
  account_category: "Day-to-Day-Operations" | "Future-Planning-Liabilities";
  description: string;
}

export const kenyanFinancialAccounts: FinancialAccount[] = [
  {
    id: 1,
    account_name: "Mobile Money Account",
    account_category: "Day-to-Day-Operations",
    description: "Primary tool for daily transactions, P2P payments, bill payments, receiving funds, and accessing short-term credit. e.g., M-Pesa, Airtel Money, T-Kash. Absolutely essential."
  },
  {
    id: 2,
    account_name: "Bank Current Account",
    account_category: "Day-to-Day-Operations",
    description: "Used for receiving salaries, business transactions, making formal payments (cheques, bank transfers), and regular banking. Often called a Chequing Account."
  },
  {
    id: 3,
    account_name: "Bank Business Account",
    account_category: "Day-to-Day-Operations",
    description: "A current account specifically designed for sole proprietors, SMEs, and corporate entities to manage business finances, payments, and collections."
  },
  {
    id: 4,
    account_name: "Credit Card Account",
    account_category: "Day-to-Day-Operations",
    description: "Used for making purchases on credit. Less prevalent than mobile money or debit cards but used by a segment for convenience, online transactions, and building credit history."
  },
  {
    id: 5,
    account_name: "Digital Wallet / Payment Gateway Account",
    account_category: "Day-to-Day-Operations",
    description: "Used for online payments, international transactions, or specific service payments through platforms like PayPal, Pesapal, DPO Pay, Skrill."
  },
  {
    id: 6,
    account_name: "Foreign Currency Account (Bank)",
    account_category: "Day-to-Day-Operations",
    description: "A bank account denominated in a foreign currency (e.g., KES,USD) used by individuals or businesses receiving or making payments in those currencies."
  },
  {
    id: 7,
    account_name: "Student Bank Account",
    account_category: "Day-to-Day-Operations",
    description: "Specialized bank accounts offered to students in tertiary institutions, often with benefits like no monthly fees, or tailored for HELB disbursements."
  },
  {
    id: 8,
    account_name: "Business Overdraft Facility Account",
    account_category: "Day-to-Day-Operations",
    description: "A credit facility linked to a business current account, allowing businesses to withdraw more money than available, up to an approved limit, for short-term cash flow needs."
  },
  {
    id: 9,
    account_name: "Sacco Account",
    account_category: "Future-Planning-Liabilities",
    description: "Crucial for savings, accessing affordable loans, and earning dividends/interest. Includes deposit accounts (BOSA), share capital, and FOSA (Front Office Savings Activity) for daily transactions. Many Kenyans belong to a SACCO."
  },
  {
    id: 10,
    account_name: "Bank Savings Account",
    account_category: "Future-Planning-Liabilities",
    description: "For accumulating personal savings, emergency funds, and earning some interest from a commercial bank."
  },
  {
    id: 11,
    account_name: "NHIF Contribution Account",
    account_category: "Future-Planning-Liabilities",
    description: "Mandatory or voluntary contributions to the National Hospital Insurance Fund for healthcare coverage. Essential for accessing medical services."
  },
  {
    id: 12,
    account_name: "NSSF Contribution Account",
    account_category: "Future-Planning-Liabilities",
    description: "Contributions to the National Social Security Fund for retirement benefits. Mandatory for formally employed individuals, voluntary for others."
  },
  {
    id: 13,
    account_name: "Mobile Loan Service Account",
    account_category: "Future-Planning-Liabilities",
    description: "Access to instant, short-term digital loans offered via mobile platforms. e.g., Fuliza, M-Shwari, KCB M-Pesa, Tala, Branch. Widely used for quick credit needs."
  },
  {
    id: 14,
    account_name: "Chama / Investment Group Account",
    account_category: "Future-Planning-Liabilities",
    description: "A joint account (often bank or mobile money group account) used by informal savings and investment groups (Chamas) to pool funds, save, and invest collectively."
  },
  {
    id: 15,
    account_name: "Money Market Fund (MMF) Account",
    account_category: "Future-Planning-Liabilities",
    description: "A popular type of Unit Trust focusing on short-term, low-risk debt securities. Used for higher-yield savings, emergency funds, and preserving capital while earning better returns than bank savings accounts."
  },
  {
    id: 16,
    account_name: "Personal Pension Plan Account",
    account_category: "Future-Planning-Liabilities",
    description: "Voluntary retirement savings plan with a registered Retirement Benefits Scheme (RBS) to supplement NSSF or for those in the informal sector."
  },
  {
    id: 17,
    account_name: "Unit Trust / Mutual Fund Account (Other than MMF)",
    account_category: "Future-Planning-Liabilities",
    description: "Investment in diversified portfolios of assets like equities (Equity Funds) or bonds (Bond Funds) managed by a fund manager. For longer-term growth or income."
  },
  {
    id: 18,
    account_name: "Microfinance Institution (MFI) Account",
    account_category: "Future-Planning-Liabilities",
    description: "Savings and loan accounts with MFIs that cater to individuals and small businesses often underserved by traditional banks, focusing on financial inclusion."
  },
  {
    id: 19,
    account_name: "Bank Loan Account (Personal/Business)",
    account_category: "Future-Planning-Liabilities",
    description: "Formal loan facility from a bank for various purposes like personal needs, business expansion, development, or asset financing."
  },
  {
    id: 20,
    account_name: "Stock Brokerage Account (CDS Account)",
    account_category: "Future-Planning-Liabilities",
    description: "Used to buy, sell, and hold shares of companies listed on the Nairobi Securities Exchange (NSE). Requires opening a Central Depository System (CDS) account."
  },
  {
    id: 21,
    account_name: "Insurance Policy Account",
    account_category: "Future-Planning-Liabilities",
    description: "Covers various risks. Includes Life Insurance, Education Policies, General Insurance (motor, home, medical if not NHIF). Managed by insurance companies."
  },
  {
    id: 22,
    account_name: "Hire Purchase Account",
    account_category: "Future-Planning-Liabilities",
    description: "A financing agreement for acquiring assets (e.g., electronics, furniture, boda-bodas) through installment payments to a financier over a specified period."
  },
  {
    id: 23,
    account_name: "Savings/Investment App Account",
    account_category: "Future-Planning-Liabilities",
    description: "Digital platforms offering goal-based savings, micro-investments, or automated investment services. e.g., Koa, Chumz, Ndovu."
  },
  {
    id: 24,
    account_name: "Fixed Deposit Account",
    account_category: "Future-Planning-Liabilities",
    description: "A bank account where money is deposited for a fixed term (e.g., 3 months, 6 months, 1 year) at a predetermined interest rate, offering higher returns than a regular savings account."
  },
  {
    id: 25,
    account_name: "Salary Advance Account/Facility",
    account_category: "Future-Planning-Liabilities",
    description: "A short-term credit facility often linked to an employee's salary account with a bank or Sacco, allowing early access to a portion of their earned salary."
  },
  {
    id: 26,
    account_name: "Treasury Bills/Bonds Account (CBK DhowCSD)",
    account_category: "Future-Planning-Liabilities",
    description: "Investment in government securities. Can be accessed directly via the Central Bank of Kenya's DhowCSD portal or through platforms like M-Akiba (mobile-traded government bond)."
  },
  {
    id: 27,
    account_name: "Cryptocurrency Exchange / Wallet Account",
    account_category: "Future-Planning-Liabilities",
    description: "Used to buy, sell, trade, and store digital currencies like Bitcoin, Ethereum. Growing in popularity among a tech-savvy niche, but not mainstream and comes with high risk and regulatory uncertainty in Kenya."
  },
  {
    id: 28,
    account_name: "Mortgage Account",
    account_category: "Future-Planning-Liabilities",
    description: "A long-term loan account used to finance the purchase of property. Less common for the general populace due to high property costs and stringent lending criteria."
  },
  {
    id: 29,
    account_name: "HELB (Higher Education Loans Board) Account",
    account_category: "Future-Planning-Liabilities",
    description: "An account representing a student loan from HELB for higher education financing. Also tracks repayments after graduation."
  },
  {
    id: 30,
    account_name: "Forex Trading Account",
    account_category: "Future-Planning-Liabilities",
    description: "Account with a licensed broker for speculative trading of foreign currencies. Distinct from holding a foreign currency bank account; involves high risk and leverage."
  },
  {
    id: 31,
    account_name: "Welfare/Benevolent Fund Account (Group/Community)",
    account_category: "Future-Planning-Liabilities",
    description: "A collective savings account, often informal or community-based, where members contribute regularly to support each other during emergencies, bereavement, or celebrations."
  }
];

