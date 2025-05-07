// financialAccountTypes.ts

// ----- Account Categories -----
export enum AccountCategoryKey {
    DAY_TO_DAY = "DAY_TO_DAY_OPERATIONS",
    FUTURE_PLANNING = "FUTURE_PLANNING_LIABILITIES",
  }
  
  export interface AccountCategoryDefinition {
    key: AccountCategoryKey;
    fullName: string;
  }
  
  export const accountCategories: Record<AccountCategoryKey, AccountCategoryDefinition> = {
    [AccountCategoryKey.DAY_TO_DAY]: {
      key: AccountCategoryKey.DAY_TO_DAY,
      fullName: "Day-to-Day Operations",
    },
    [AccountCategoryKey.FUTURE_PLANNING]: {
      key: AccountCategoryKey.FUTURE_PLANNING,
      fullName: "Future Planning & Liabilities",
    },
  };
  
  // ----- Account Names (Keys and Definitions) -----
  // We'll use string literal union for keys for better type inference from object keys
  export const accountNameKeys = {
    MOBILE_MONEY: "MOBILE_MONEY",
    BANK_CURRENT: "BANK_CURRENT",
    BANK_BUSINESS: "BANK_BUSINESS",
    CREDIT_CARD: "CREDIT_CARD",
    DIGITAL_WALLET_GATEWAY: "DIGITAL_WALLET_GATEWAY",
    FOREIGN_CURRENCY_BANK: "FOREIGN_CURRENCY_BANK",
    STUDENT_BANK: "STUDENT_BANK",
    BUSINESS_OVERDRAFT: "BUSINESS_OVERDRAFT",
    SACCO: "SACCO",
    BANK_SAVINGS: "BANK_SAVINGS",
    NHIF_CONTRIBUTION: "NHIF_CONTRIBUTION",
    NSSF_CONTRIBUTION: "NSSF_CONTRIBUTION",
    TAX_OBLIGATION_IMPLICIT: "TAX_OBLIGATION_IMPLICIT",
    MOBILE_LOAN_SERVICE: "MOBILE_LOAN_SERVICE",
    CHAMA_INVESTMENT_GROUP: "CHAMA_INVESTMENT_GROUP",
    MONEY_MARKET_FUND: "MONEY_MARKET_FUND",
    PERSONAL_PENSION_PLAN: "PERSONAL_PENSION_PLAN",
    UNIT_TRUST_MUTUAL_FUND_OTHER: "UNIT_TRUST_MUTUAL_FUND_OTHER",
    MFI_ACCOUNT: "MFI_ACCOUNT",
    BANK_LOAN_PERSONAL_BUSINESS: "BANK_LOAN_PERSONAL_BUSINESS",
    STOCK_BROKERAGE_CDS: "STOCK_BROKERAGE_CDS",
    INSURANCE_POLICY: "INSURANCE_POLICY",
    HIRE_PURCHASE: "HIRE_PURCHASE",
    SAVINGS_INVESTMENT_APP: "SAVINGS_INVESTMENT_APP",
    FIXED_DEPOSIT: "FIXED_DEPOSIT",
    SALARY_ADVANCE: "SALARY_ADVANCE",
    TREASURY_BILLS_BONDS_CBK: "TREASURY_BILLS_BONDS_CBK",
    CRYPTO_EXCHANGE_WALLET: "CRYPTO_EXCHANGE_WALLET",
    MORTGAGE: "MORTGAGE",
    HELB_ACCOUNT: "HELB_ACCOUNT",
    FOREX_TRADING: "FOREX_TRADING",
    WELFARE_BENEVOLENT_FUND: "WELFARE_BENEVOLENT_FUND",
  } as const; // 'as const' makes keys and values readonly string literals
  
  export type AccountNameKey = typeof accountNameKeys[keyof typeof accountNameKeys];
  
  export interface AccountNameDefinition {
    key: AccountNameKey;
    fullName: string;
    defaultDescription: string; // A general description
    defaultCategoryKey: AccountCategoryKey; // The most typical category for this account
  }
  
  export const financialAccountDefinitions: Record<AccountNameKey, AccountNameDefinition> = {
    [accountNameKeys.MOBILE_MONEY]: {
      key: accountNameKeys.MOBILE_MONEY,
      fullName: "Mobile Money Account",
      defaultDescription: "Primary tool for daily transactions, P2P payments, bill payments, receiving funds, and accessing short-term credit. e.g., M-Pesa, Airtel Money, T-Kash.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.BANK_CURRENT]: {
      key: accountNameKeys.BANK_CURRENT,
      fullName: "Bank Current Account",
      defaultDescription: "Used for receiving salaries, business transactions, making formal payments (cheques, bank transfers), and regular banking. Often called a Chequing Account.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.BANK_BUSINESS]: {
      key: accountNameKeys.BANK_BUSINESS,
      fullName: "Bank Business Account",
      defaultDescription: "A current account specifically designed for sole proprietors, SMEs, and corporate entities to manage business finances, payments, and collections.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.CREDIT_CARD]: {
      key: accountNameKeys.CREDIT_CARD,
      fullName: "Credit Card Account",
      defaultDescription: "Used for making purchases on credit. Less prevalent than mobile money or debit cards but used by a segment for convenience, online transactions, and building credit history.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.DIGITAL_WALLET_GATEWAY]: {
      key: accountNameKeys.DIGITAL_WALLET_GATEWAY,
      fullName: "Digital Wallet / Payment Gateway Account",
      defaultDescription: "Used for online payments, international transactions, or specific service payments through platforms like PayPal, Pesapal, DPO Pay, Skrill.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.FOREIGN_CURRENCY_BANK]: {
      key: accountNameKeys.FOREIGN_CURRENCY_BANK,
      fullName: "Foreign Currency Account (Bank)",
      defaultDescription: "A bank account denominated in a foreign currency (e.g., USD, EUR, GBP) used by individuals or businesses receiving or making payments in those currencies.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.STUDENT_BANK]: {
      key: accountNameKeys.STUDENT_BANK,
      fullName: "Student Bank Account",
      defaultDescription: "Specialized bank accounts offered to students in tertiary institutions, often with benefits like no monthly fees, or tailored for HELB disbursements.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.BUSINESS_OVERDRAFT]: {
      key: accountNameKeys.BUSINESS_OVERDRAFT,
      fullName: "Business Overdraft Facility Account",
      defaultDescription: "A credit facility linked to a business current account, allowing businesses to withdraw more money than available, up to an approved limit, for short-term cash flow needs.",
      defaultCategoryKey: AccountCategoryKey.DAY_TO_DAY,
    },
    [accountNameKeys.SACCO]: {
      key: accountNameKeys.SACCO,
      fullName: "Sacco Account",
      defaultDescription: "Crucial for savings, accessing affordable loans, and earning dividends/interest. Includes deposit accounts (BOSA), share capital, and FOSA (Front Office Savings Activity).",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.BANK_SAVINGS]: {
      key: accountNameKeys.BANK_SAVINGS,
      fullName: "Bank Savings Account",
      defaultDescription: "For accumulating personal savings, emergency funds, and earning some interest from a commercial bank.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.NHIF_CONTRIBUTION]: {
      key: accountNameKeys.NHIF_CONTRIBUTION,
      fullName: "NHIF Contribution Account",
      defaultDescription: "Mandatory or voluntary contributions to the National Hospital Insurance Fund for healthcare coverage. Essential for accessing medical services.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.NSSF_CONTRIBUTION]: {
      key: accountNameKeys.NSSF_CONTRIBUTION,
      fullName: "NSSF Contribution Account",
      defaultDescription: "Contributions to the National Social Security Fund for retirement benefits. Mandatory for formally employed individuals, voluntary for others.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.TAX_OBLIGATION_IMPLICIT]: {
      key: accountNameKeys.TAX_OBLIGATION_IMPLICIT,
      fullName: "Tax Obligation Account (Implicit)",
      defaultDescription: "Represents the ongoing financial obligation of individuals and businesses to pay taxes to the Kenya Revenue Authority (KRA). Managed through KRA's systems (e.g., iTax).",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.MOBILE_LOAN_SERVICE]: {
      key: accountNameKeys.MOBILE_LOAN_SERVICE,
      fullName: "Mobile Loan Service Account",
      defaultDescription: "Access to instant, short-term digital loans offered via mobile platforms. e.g., Fuliza, M-Shwari, KCB M-Pesa, Tala, Branch. Widely used for quick credit needs.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.CHAMA_INVESTMENT_GROUP]: {
      key: accountNameKeys.CHAMA_INVESTMENT_GROUP,
      fullName: "Chama / Investment Group Account",
      defaultDescription: "A joint account (often bank or mobile money group account) used by informal savings and investment groups (Chamas) to pool funds, save, and invest collectively.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.MONEY_MARKET_FUND]: {
      key: accountNameKeys.MONEY_MARKET_FUND,
      fullName: "Money Market Fund (MMF) Account",
      defaultDescription: "A popular type of Unit Trust focusing on short-term, low-risk debt securities. Used for higher-yield savings, emergency funds, and preserving capital.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.PERSONAL_PENSION_PLAN]: {
      key: accountNameKeys.PERSONAL_PENSION_PLAN,
      fullName: "Personal Pension Plan Account",
      defaultDescription: "Voluntary retirement savings plan with a registered Retirement Benefits Scheme (RBS) to supplement NSSF or for those in the informal sector.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.UNIT_TRUST_MUTUAL_FUND_OTHER]: {
      key: accountNameKeys.UNIT_TRUST_MUTUAL_FUND_OTHER,
      fullName: "Unit Trust / Mutual Fund Account (Other than MMF)",
      defaultDescription: "Investment in diversified portfolios of assets like equities (Equity Funds) or bonds (Bond Funds) managed by a fund manager. For longer-term growth or income.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.MFI_ACCOUNT]: {
      key: accountNameKeys.MFI_ACCOUNT,
      fullName: "Microfinance Institution (MFI) Account",
      defaultDescription: "Savings and loan accounts with MFIs that cater to individuals and small businesses often underserved by traditional banks, focusing on financial inclusion.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS]: {
      key: accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      fullName: "Bank Loan Account (Personal/Business)",
      defaultDescription: "Formal loan facility from a bank for various purposes like personal needs, business expansion, development, or asset financing.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.STOCK_BROKERAGE_CDS]: {
      key: accountNameKeys.STOCK_BROKERAGE_CDS,
      fullName: "Stock Brokerage Account (CDS Account)",
      defaultDescription: "Used to buy, sell, and hold shares of companies listed on the Nairobi Securities Exchange (NSE). Requires opening a Central Depository System (CDS) account.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.INSURANCE_POLICY]: {
      key: accountNameKeys.INSURANCE_POLICY,
      fullName: "Insurance Policy Account",
      defaultDescription: "Covers various risks. Includes Life Insurance, Education Policies, General Insurance (motor, home, medical if not NHIF). Managed by insurance companies.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.HIRE_PURCHASE]: {
      key: accountNameKeys.HIRE_PURCHASE,
      fullName: "Hire Purchase Account",
      defaultDescription: "A financing agreement for acquiring assets (e.g., electronics, furniture, boda-bodas) through installment payments to a financier over a specified period.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.SAVINGS_INVESTMENT_APP]: {
      key: accountNameKeys.SAVINGS_INVESTMENT_APP,
      fullName: "Savings/Investment App Account",
      defaultDescription: "Digital platforms offering goal-based savings, micro-investments, or automated investment services. e.g., Koa, Chumz, Ndovu.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.FIXED_DEPOSIT]: {
      key: accountNameKeys.FIXED_DEPOSIT,
      fullName: "Fixed Deposit Account",
      defaultDescription: "A bank account where money is deposited for a fixed term at a predetermined interest rate, offering higher returns than a regular savings account.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.SALARY_ADVANCE]: {
      key: accountNameKeys.SALARY_ADVANCE,
      fullName: "Salary Advance Account/Facility",
      defaultDescription: "A short-term credit facility often linked to an employee's salary account with a bank or Sacco, allowing early access to a portion of their earned salary.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.TREASURY_BILLS_BONDS_CBK]: {
      key: accountNameKeys.TREASURY_BILLS_BONDS_CBK,
      fullName: "Treasury Bills/Bonds Account (CBK DhowCSD)",
      defaultDescription: "Investment in government securities. Can be accessed directly via the Central Bank of Kenya's DhowCSD portal or through platforms like M-Akiba.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.CRYPTO_EXCHANGE_WALLET]: {
      key: accountNameKeys.CRYPTO_EXCHANGE_WALLET,
      fullName: "Cryptocurrency Exchange / Wallet Account",
      defaultDescription: "Used to buy, sell, trade, and store digital currencies like Bitcoin, Ethereum. Growing in popularity among a tech-savvy niche, but with high risk and regulatory uncertainty.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.MORTGAGE]: {
      key: accountNameKeys.MORTGAGE,
      fullName: "Mortgage Account",
      defaultDescription: "A long-term loan account used to finance the purchase of property. Less common for the general populace due to high property costs and stringent lending criteria.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.HELB_ACCOUNT]: {
      key: accountNameKeys.HELB_ACCOUNT,
      fullName: "HELB (Higher Education Loans Board) Account",
      defaultDescription: "An account representing a student loan from HELB for higher education financing. Also tracks repayments after graduation.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.FOREX_TRADING]: {
      key: accountNameKeys.FOREX_TRADING,
      fullName: "Forex Trading Account",
      defaultDescription: "Account with a licensed broker for speculative trading of foreign currencies. Distinct from holding a foreign currency bank account; involves high risk and leverage.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
    [accountNameKeys.WELFARE_BENEVOLENT_FUND]: {
      key: accountNameKeys.WELFARE_BENEVOLENT_FUND,
      fullName: "Welfare/Benevolent Fund Account (Group/Community)",
      defaultDescription: "A collective savings account, often informal or community-based, where members contribute regularly to support each other during emergencies, bereavement, or celebrations.",
      defaultCategoryKey: AccountCategoryKey.FUTURE_PLANNING,
    },
  };