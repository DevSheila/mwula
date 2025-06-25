import { PDFDocument } from 'pdf-lib';

export async function isPdfPasswordProtected(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false 
    });
    
    // If the document is encrypted, it means it's password protected
    return pdfDoc.isEncrypted;
  } catch (error) {
    // If there's an error loading the PDF, it might be due to encryption
    console.error('Error checking PDF protection:', error);
    return true;
  }
}

export async function loadProtectedPdf(file: File, password: string): Promise<ArrayBuffer> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      password,
      updateMetadata: false 
    });
    
    // If we get here, the password was correct
    // Return the decrypted PDF as ArrayBuffer
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error loading protected PDF:', error);
    throw new Error('Invalid password or corrupted PDF');
  }
}

// Function to split content into manageable chunks
export function splitContentIntoChunks(content: string, chunkSize: number = 5000): string[] {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid content provided for splitting');
  }

  // Split content into lines
  const lines = content.split('\n');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentSize = 0;

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    if (currentSize + line.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [];
      currentSize = 0;
    }
    currentChunk.push(line);
    currentSize += line.length;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  // If no chunks were created, create at least one with the trimmed content
  if (chunks.length === 0 && content.trim()) {
    chunks.push(content.trim());
  }

  return chunks;
}

export interface Transaction {
  date: string;
  payee: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  notes?: string;
  category: string;
}

export interface AccountInfo {
  institutionName: string | null;
  accountNumber: string | null;
  accountType: string | null;
}

export interface GeminiResponse {
  accountInfo: AccountInfo;
  transactions: Transaction[];
}

// Function to merge transaction arrays from multiple responses
export function mergeTransactions(responses: GeminiResponse[]): GeminiResponse {
  if (!Array.isArray(responses) || responses.length === 0) {
    throw new Error('No valid responses to merge');
  }

  // Initialize with the first response's accountInfo
  const mergedResult: GeminiResponse = {
    accountInfo: responses[0]?.accountInfo || {
      institutionName: null,
      accountNumber: null,
      accountType: null
    },
    transactions: []
  };

  // Create a Set to track unique transaction strings to avoid duplicates
  const uniqueTransactions = new Set<string>();

  // Merge all transactions
  for (const response of responses) {
    if (response?.transactions?.length) {
      for (const transaction of response.transactions) {
        // Create a unique key for the transaction
        const transactionKey = JSON.stringify({
          date: transaction.date,
          payee: transaction.payee,
          amount: transaction.amount,
          type: transaction.type
        });

        // Only add if we haven't seen this transaction before
        if (!uniqueTransactions.has(transactionKey)) {
          uniqueTransactions.add(transactionKey);
          mergedResult.transactions.push(transaction);
        }
      }
    }
  }

  // Sort transactions by date (newest first)
  mergedResult.transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return mergedResult;
} 