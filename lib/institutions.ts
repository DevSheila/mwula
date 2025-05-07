// kenyanInstitutions.ts

import { AccountNameKey, accountNameKeys, financialAccountDefinitions, accountCategories } from './accountTypes'; // Import the keys

export interface InstitutionAccountMapping {
  institution_name: string;
  institution_type: string;
  list_of_account_name_keys: AccountNameKey[];
}

export const kenyanInstitutionsAndAccounts: InstitutionAccountMapping[] = [
  {
    institution_name: "KCB Bank Kenya",
    institution_type: "Commercial Bank",
    list_of_account_name_keys: [
      accountNameKeys.BANK_CURRENT,
      accountNameKeys.BANK_SAVINGS,
      accountNameKeys.BANK_BUSINESS,
      accountNameKeys.MOBILE_LOAN_SERVICE,
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.CREDIT_CARD,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.FOREIGN_CURRENCY_BANK,
      accountNameKeys.MORTGAGE,
      accountNameKeys.STUDENT_BANK,
      accountNameKeys.BUSINESS_OVERDRAFT,
      accountNameKeys.SALARY_ADVANCE,
      accountNameKeys.STOCK_BROKERAGE_CDS,
    ],
  },
  {
    institution_name: "Equity Bank Kenya",
    institution_type: "Commercial Bank",
    list_of_account_name_keys: [
      accountNameKeys.BANK_CURRENT,
      accountNameKeys.BANK_SAVINGS,
      accountNameKeys.BANK_BUSINESS,
      accountNameKeys.MOBILE_LOAN_SERVICE,
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.CREDIT_CARD,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.FOREIGN_CURRENCY_BANK,
      accountNameKeys.MORTGAGE,
      accountNameKeys.STUDENT_BANK,
      accountNameKeys.BUSINESS_OVERDRAFT,
      accountNameKeys.SALARY_ADVANCE,
      accountNameKeys.STOCK_BROKERAGE_CDS,
      accountNameKeys.CHAMA_INVESTMENT_GROUP,
    ],
  },
  {
    institution_name: "Co-operative Bank of Kenya",
    institution_type: "Commercial Bank",
    list_of_account_name_keys: [
      accountNameKeys.BANK_CURRENT,
      accountNameKeys.BANK_SAVINGS,
      accountNameKeys.BANK_BUSINESS,
      accountNameKeys.MOBILE_LOAN_SERVICE,
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.CREDIT_CARD,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.FOREIGN_CURRENCY_BANK,
      accountNameKeys.MORTGAGE,
      accountNameKeys.STUDENT_BANK,
      accountNameKeys.BUSINESS_OVERDRAFT,
      accountNameKeys.SALARY_ADVANCE,
      accountNameKeys.STOCK_BROKERAGE_CDS,
    ],
  },
  {
    institution_name: "Absa Bank Kenya",
    institution_type: "Commercial Bank",
    list_of_account_name_keys: [
      accountNameKeys.BANK_CURRENT,
      accountNameKeys.BANK_SAVINGS,
      accountNameKeys.BANK_BUSINESS,
      accountNameKeys.MOBILE_LOAN_SERVICE, // Timiza
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.CREDIT_CARD,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.FOREIGN_CURRENCY_BANK,
      accountNameKeys.MORTGAGE,
      accountNameKeys.STUDENT_BANK,
      accountNameKeys.BUSINESS_OVERDRAFT,
      accountNameKeys.SALARY_ADVANCE,
    ],
  },
  {
    institution_name: "Standard Chartered Bank Kenya",
    institution_type: "Commercial Bank",
    list_of_account_name_keys: [
      accountNameKeys.BANK_CURRENT,
      accountNameKeys.BANK_SAVINGS,
      accountNameKeys.BANK_BUSINESS,
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.CREDIT_CARD,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.FOREIGN_CURRENCY_BANK,
      accountNameKeys.MORTGAGE,
      accountNameKeys.SALARY_ADVANCE,
    ],
  },
  {
    institution_name: "NCBA Bank Kenya",
    institution_type: "Commercial Bank",
    list_of_account_name_keys: [
      accountNameKeys.BANK_CURRENT,
      accountNameKeys.BANK_SAVINGS,
      accountNameKeys.BANK_BUSINESS,
      accountNameKeys.MOBILE_LOAN_SERVICE, // M-Shwari, Fuliza partner
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.CREDIT_CARD,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.FOREIGN_CURRENCY_BANK,
      accountNameKeys.MORTGAGE,
      accountNameKeys.BUSINESS_OVERDRAFT,
      accountNameKeys.SALARY_ADVANCE,
      accountNameKeys.MONEY_MARKET_FUND,
      accountNameKeys.UNIT_TRUST_MUTUAL_FUND_OTHER,
      accountNameKeys.STOCK_BROKERAGE_CDS, // Via NCBA Investment Bank
    ],
  },
  {
    institution_name: "Stanbic Bank Kenya",
    institution_type: "Commercial Bank",
    list_of_account_name_keys: [
      accountNameKeys.BANK_CURRENT,
      accountNameKeys.BANK_SAVINGS,
      accountNameKeys.BANK_BUSINESS,
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.CREDIT_CARD,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.FOREIGN_CURRENCY_BANK,
      accountNameKeys.MORTGAGE,
      accountNameKeys.STUDENT_BANK,
      accountNameKeys.BUSINESS_OVERDRAFT,
      accountNameKeys.SALARY_ADVANCE,
      accountNameKeys.STOCK_BROKERAGE_CDS, // Via SBG Securities
      accountNameKeys.MONEY_MARKET_FUND, // Via Stanbic Investment Management Services
      accountNameKeys.UNIT_TRUST_MUTUAL_FUND_OTHER, // Via Stanbic Investment Management Services
    ],
  },
  // ... (Continue for all other institutions, replacing string account names with accountNameKeys.KEY_NAME)
  {
    institution_name: "Safaricom PLC (for M-Pesa)",
    institution_type: "Mobile Network Operator (Mobile Money Service)",
    list_of_account_name_keys: [
      accountNameKeys.MOBILE_MONEY,
      accountNameKeys.MOBILE_LOAN_SERVICE, // Fuliza, M-Shwari (as platform)
    ],
  },
  {
    institution_name: "National Hospital Insurance Fund (NHIF)",
    institution_type: "Statutory Body / Government Agency",
    list_of_account_name_keys: [accountNameKeys.NHIF_CONTRIBUTION],
  },
  {
    institution_name: "National Social Security Fund (NSSF)",
    institution_type: "Statutory Body / Government Agency",
    list_of_account_name_keys: [accountNameKeys.NSSF_CONTRIBUTION],
  },
  {
    institution_name: "Kenya Revenue Authority (KRA)",
    institution_type: "Statutory Body / Government Agency (Tax Collection)",
    list_of_account_name_keys: [accountNameKeys.TAX_OBLIGATION_IMPLICIT],
  },
  {
    institution_name: "Tala",
    institution_type: "Digital Lender / Fintech Credit Provider",
    list_of_account_name_keys: [accountNameKeys.MOBILE_LOAN_SERVICE],
  },
  {
    institution_name: "Britam Asset Managers", // Also Britam Holdings for Insurance
    institution_type: "Investment Bank / Fund Manager / Unit Trust Provider",
    list_of_account_name_keys: [
      accountNameKeys.MONEY_MARKET_FUND,
      accountNameKeys.UNIT_TRUST_MUTUAL_FUND_OTHER,
      accountNameKeys.PERSONAL_PENSION_PLAN,
      accountNameKeys.INSURANCE_POLICY, // From Britam Holdings
    ],
  },
  {
    institution_name: "Binance",
    institution_type: "Cryptocurrency Exchange & Platform (International)",
    list_of_account_name_keys: [accountNameKeys.CRYPTO_EXCHANGE_WALLET],
  },
  {
    institution_name: "Chama / Merry-go-round / Welfare Fund Group",
    institution_type: "Informal Financial Group (Community-Based)",
    list_of_account_name_keys: [
      accountNameKeys.CHAMA_INVESTMENT_GROUP,
      accountNameKeys.WELFARE_BENEVOLENT_FUND,
    ],
  },
  // ... ADD ALL OTHER INSTITUTIONS HERE, MAPPED TO KEYS ...
  // Example for a SACCO
  {
    institution_name: "Mwalimu National Sacco",
    institution_type: "SACCO (Savings and Credit Co-operative Society)",
    list_of_account_name_keys: [
      accountNameKeys.SACCO,
      accountNameKeys.BANK_LOAN_PERSONAL_BUSINESS,
      accountNameKeys.MOBILE_LOAN_SERVICE,
      accountNameKeys.FIXED_DEPOSIT,
      accountNameKeys.SALARY_ADVANCE,
    ],
  },
  // Example for another Digital Lender
   {
    institution_name: "M-Shwari (NCBA & Safaricom)", // Product name, institution is NCBA/Safaricom
    institution_type: "Digital Lender / Fintech Credit Provider",
    list_of_account_name_keys: [
      accountNameKeys.MOBILE_LOAN_SERVICE,
      accountNameKeys.BANK_SAVINGS, // M-Shwari Lock Savings
    ],
  },
];

// Helper function to get institution data with full account names
export function getInstitutionWithFullAccountNames(
  institutionMapping: InstitutionAccountMapping
) {
  const accountsWithFullNames = institutionMapping.list_of_account_name_keys.map(
    (key) => {
      const definition = financialAccountDefinitions[key];
      return {
        key: definition.key,
        fullName: definition.fullName,
        categoryFullName: accountCategories[definition.defaultCategoryKey].fullName,
      };
    }
  );
  return {
    ...institutionMapping,
    accounts_detailed: accountsWithFullNames,
  };
}