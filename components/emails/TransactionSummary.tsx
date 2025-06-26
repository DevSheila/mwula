import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Link,
} from "@react-email/components";
import { format } from "date-fns";

interface TransactionSummaryEmailProps {
  userName: string;
  remainingAmount: number;
  remainingChange: number;
  incomeAmount: number;
  incomeChange: number;
  expensesAmount: number;
  expensesChange: number;
  categories: Array<{
    name: string;
    value: number;
  }>;
  startDate: Date;
  endDate: Date;
}

const hasNoTransactions = ({
  remainingAmount,
  incomeAmount,
  expensesAmount,
  categories,
}: Pick<TransactionSummaryEmailProps, 'remainingAmount' | 'incomeAmount' | 'expensesAmount' | 'categories'>) => {
  return remainingAmount === 0 && 
         incomeAmount === 0 && 
         expensesAmount === 0 && 
         categories.length === 0;
};

export const TransactionSummaryEmail = ({
  userName,
  remainingAmount,
  remainingChange,
  incomeAmount,
  incomeChange,
  expensesAmount,
  expensesChange,
  categories,
  startDate,
  endDate,
}: TransactionSummaryEmailProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      signDisplay: "auto",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value}%`;
  };

  const noTransactions = hasNoTransactions({ remainingAmount, incomeAmount, expensesAmount, categories });

  return (
    <Html>
      <Head />
      <Preview>
        {noTransactions 
          ? "Start tracking your finances today!" 
          : `Your Financial Summary for ${format(startDate, "MMMM yyyy")}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Hi {userName},
          </Heading>

          {noTransactions ? (
            <>
              <Text style={text}>
                We noticed you haven't uploaded any transactions for the period between {format(startDate, "MMMM d")} - {format(endDate, "MMMM d, yyyy")}.
              </Text>
              <Section style={section}>
                <Text style={noDataText}>
                  Start tracking your finances today! Upload your transactions to get personalized insights and summaries about your spending habits.
                </Text>
                <Text style={noDataText}>
                  By keeping your transactions up to date, you'll be able to:
                </Text>
                <ul style={bulletPoints}>
                  <li>Track your income and expenses</li>
                  <li>Monitor your spending patterns</li>
                  <li>Get insights into your top spending categories</li>
                  <li>Stay on top of your financial goals</li>
                </ul>
              </Section>
              <Text style={footer}>
                <Link href="/dashboard/transactions" style={link}>Click here to upload your transactions</Link>
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>
                Here's your financial summary for {format(startDate, "MMMM d")} - {format(endDate, "MMMM d, yyyy")}.
              </Text>

              <Section style={section}>
                <Row>
                  <Column>
                    <Text style={label}>Balance</Text>
                    <Text style={amount}>{formatCurrency(remainingAmount)}</Text>
                    <Text style={change}>{formatPercentage(remainingChange)}</Text>
                  </Column>
                  <Column>
                    <Text style={label}>Income</Text>
                    <Text style={amount}>{formatCurrency(incomeAmount)}</Text>
                    <Text style={change}>{formatPercentage(incomeChange)}</Text>
                  </Column>
                  <Column>
                    <Text style={label}>Expenses</Text>
                    <Text style={amount}>{formatCurrency(expensesAmount)}</Text>
                    <Text style={change}>{formatPercentage(expensesChange)}</Text>
                  </Column>
                </Row>
              </Section>

              <Section style={section}>
                <Heading as="h2" style={h2}>Top Spending Categories</Heading>
                {categories.map((category) => (
                  <Row key={category.name} style={categoryRow}>
                    <Column>
                      <Text style={categoryName}>{category.name}</Text>
                    </Column>
                    <Column>
                      <Text style={categoryValue}>{formatCurrency(category.value)}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>

              <Text style={footer}>
                View detailed analytics in your dashboard
              </Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "24px",
  border: "solid 1px #e6e6e6",
  borderRadius: "8px",
  margin: "24px 0",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "16px 0",
};

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "12px 0",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.4",
  margin: "0 0 20px",
};

const noDataText = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const bulletPoints = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
  paddingLeft: "20px",
};

const label = {
  color: "#6b7280",
  fontSize: "14px",
  marginBottom: "4px",
};

const amount = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const change = {
  fontSize: "16px",
  color: "#059669",
  margin: "4px 0 0",
};

const categoryRow = {
  margin: "8px 0",
};

const categoryName = {
  color: "#4b5563",
  fontSize: "16px",
  margin: "0",
};

const categoryValue = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "300",
  margin: "0",
  textAlign: "right" as const,
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "48px 0 0",
  textAlign: "center" as const,
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

export default TransactionSummaryEmail; 