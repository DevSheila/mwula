import { z } from "zod";

interface ExchangeRate {
  rate: number;
  timestamp: number;
}

// Cache exchange rates for 1 hour
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const rateCache = new Map<string, ExchangeRate>();

const exchangeRateSchema = z.object({
  result: z.string(),
  documentation: z.string(),
  terms_of_use: z.string(),
  time_last_update_unix: z.number(),
  time_next_update_unix: z.number(),
  conversion_rate: z.number(),
});

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  const cacheKey = `${fromCurrency}_${toCurrency}`;
  const cachedRate = rateCache.get(cacheKey);
  
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
    return amount * cachedRate.rate;
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${fromCurrency}/${toCurrency}`
    );
    
    const data = await response.json();
    const parsed = exchangeRateSchema.parse(data);
    
    rateCache.set(cacheKey, {
      rate: parsed.conversion_rate,
      timestamp: Date.now(),
    });

    return amount * parsed.conversion_rate;
  } catch (error) {
    console.error("Failed to convert currency:", error);
    return amount; // Return original amount if conversion fails
  }
}

export async function convertAmounts(
  amounts: { amount: number; currency: string }[],
  targetCurrency: string
): Promise<number> {
  const convertedAmounts = await Promise.all(
    amounts.map(({ amount, currency }) => 
      convertCurrency(amount, currency, targetCurrency)
    )
  );
  
  return convertedAmounts.reduce((sum, amount) => sum + amount, 0);
}