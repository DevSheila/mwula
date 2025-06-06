import { FileText } from "lucide-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { isPdfPasswordProtected, splitContentIntoChunks, mergeTransactions } from "@/lib/pdf-utils";
import { extractPdfContent } from "@/lib/pdf-api";
import { PdfPasswordDialog } from "@/components/pdf-password-dialog";
import type { Transaction, GeminiResponse } from "@/lib/pdf-utils";

type PDFUploadButtonProps = {
  onUpload?: (results: any) => void;
  onClose: () => void;
};

type ProcessingProgress = {
  current: number;
  total: number;
};

export const PDFUploadButton = ({ onUpload, onClose }: PDFUploadButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [AccountDialog, confirm] = useSelectAccount();
  const createTransactions = useBulkCreateTransactions();
  const { data: categories = [] } = useGetCategories();

  // State for password protected PDF handling
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress>({ current: 0, total: 0 });

  const cleanJsonResponse = (text: string): string => {
    try {
      // First try to find JSON within code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1].trim();
        // Validate it's parseable
        JSON.parse(jsonStr);
        return jsonStr;
      }

      // If no code blocks or invalid JSON in code blocks, try to find JSON directly
      const possibleJson = text.trim();
      // Validate it's parseable
      JSON.parse(possibleJson);
      return possibleJson;
    } catch (error) {
      console.error('Error cleaning JSON response:', error);
      throw new Error('Invalid JSON response from Gemini');
    }
  };

  const convertAmount = (amount: number | null | undefined, type: string | null | undefined, payee: string | null | undefined): number => {
    // Handle null/undefined amounts
    if (amount === null || amount === undefined) {
      console.warn('Invalid amount detected:', amount);
      return 0;
    }

    // Convert amount to number if it's a string
    const numericAmount = Number(amount);

    // Validate the amount is a valid number
    if (isNaN(numericAmount)) {
      console.warn('Invalid amount detected:', amount);
      return 0;
    }

    // Format to 2 decimal places and convert to cents
    const amountStr = numericAmount.toFixed(2);
    const cents = parseInt(amountStr.replace('.', ''));

    // Determine transaction type if not provided or invalid
    let transactionType = type?.toUpperCase()?.trim() || '';
    
    // If type is not explicitly set, try to infer from context
    if (!transactionType || (transactionType !== 'EXPENSE' && transactionType !== 'INCOME')) {
      // Common expense indicators in payee or transaction details
      const expenseKeywords = [
        'PAYMENT', 'PAY', 'SENT', 'WITHDRAW', 'PURCHASE', 'BUY', 'FEE', 'CHARGE', 
        'DEBIT', 'PAID', 'SEND MONEY', 'WITHDRAWAL', 'BUY GOODS'
      ];
      
      // Common income indicators in payee or transaction details
      const incomeKeywords = [
        'RECEIVED', 'DEPOSIT', 'CREDIT', 'REFUND', 'SALARY', 'PAYMENT RECEIVED',
        'MONEY RECEIVED', 'AGENT DEPOSIT', 'RECEIVED MONEY'
      ];

      const payeeText = (payee || '').toUpperCase();
      
      // Check for expense keywords
      const isExpense = expenseKeywords.some(keyword => 
        payeeText.includes(keyword.toUpperCase())
      );

      // Check for income keywords
      const isIncome = incomeKeywords.some(keyword => 
        payeeText.includes(keyword.toUpperCase())
      );

      // If we can detect the type from keywords, use that
      if (isExpense && !isIncome) {
        transactionType = 'EXPENSE';
      } else if (isIncome && !isExpense) {
        transactionType = 'INCOME';
      } else {
        // If we can't determine type from keywords, use the sign of the amount
        transactionType = numericAmount >= 0 ? 'INCOME' : 'EXPENSE';
      }

      console.log('Inferred transaction type:', {
        payee: payeeText,
        amount: numericAmount,
        inferredType: transactionType
      });
    }

    // Return negative value for expenses, positive for income
    return transactionType === 'EXPENSE' ? -Math.abs(cents) : Math.abs(cents);
  };

  const processWithGeminiAI = async (pdfContent: string): Promise<string> => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const availableCategories = categories.map(cat => ({
        name: cat.name,
        description: cat.description,
        id: cat.id
      }));

      const prompt = `Analyze this PDF financial document content and extract transaction and account details. The content is pre-extracted text from a financial document (which may be a bank statement, invoice, or other financial record).

      Return the results in JSON format with the following structure:
      {
        "accountInfo": {
          "institutionName": "detected institution name or empty string",
          "accountNumber": "detected account number or empty string",
          "accountType": "detected account type or empty string (e.g. checking, savings, credit card, etc.)"
        },
        "transactions": [
          {
            "date": "YYYY-MM-DD" or empty string,
            "payee": "name of payer/payee" or empty string,
            "amount": total amount as a number with exact precision (e.g., 17000.00 should be 17000.00, 56 should be 56.00) or 0,
            "type": "EXPENSE" or "INCOME" or empty string,
            "notes": "Include document type (statement/invoice), document number if available, and relevant details" or empty string,
            "category": "name of the most appropriate category from the list below" or empty string
          }
        ]
      }

      Available categories:
      ${JSON.stringify(availableCategories, null, 2)}

      PDF Content to analyze:
      ${pdfContent}`;

      const result = await model.generateContent([prompt]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in Gemini processing:', error);
      throw new Error('Failed to process content with Gemini');
    }
  };

  const processPDFDocuments = async (files: File[], password?: string) => {
    try {
      setIsProcessing(true);

      // Process each file
      for (const file of files) {
        try {
          console.log(`Processing file: ${file.name}`);
          
          // Extract content using FastAPI
          console.log('Sending to FastAPI for extraction...');
          const pdfContent = await extractPdfContent(file, password);
          console.log('Content extracted successfully');
          
          // Split content into manageable chunks
          const chunks = splitContentIntoChunks(pdfContent);
          console.log(`Split content into ${chunks.length} chunks`);
          
          setProcessingProgress({ current: 0, total: chunks.length });
          
          // Process each chunk with Gemini
          const chunkResponses: GeminiResponse[] = [];
          for (let i = 0; i < chunks.length; i++) {
            try {
              console.log(`Processing chunk ${i + 1}/${chunks.length}`);
              const geminiResponse = await processWithGeminiAI(chunks[i]);
              const cleanedJson = cleanJsonResponse(geminiResponse);
              const parsedData = JSON.parse(cleanedJson) as GeminiResponse;
              chunkResponses.push(parsedData);
              setProcessingProgress({ current: i + 1, total: chunks.length });
            } catch (error) {
              console.error(`Error processing chunk ${i + 1}:`, error);
              // Continue with other chunks even if one fails
            }
          }

          // Merge responses from all chunks
          if (chunkResponses.length === 0) {
            throw new Error('No valid data extracted from PDF');
          }

          const mergedData = mergeTransactions(chunkResponses);
          console.log('Merged data from all chunks:', mergedData);

          // Get account selection from user
          const accountId = await confirm({
            suggestedAccount: {
              ...mergedData.accountInfo,
              accountName: mergedData.accountInfo.institutionName || 'Imported Account'
            }
          });
          
          if (!accountId) {
            console.log('User cancelled account selection');
            toast.error("Please select an account to continue.");
            return;
          }

          // Transform the data
          const transformedData = mergedData.transactions.map((transaction: Transaction) => {
            const category = categories.find(cat => 
              cat.name.toLowerCase() === (transaction.category || '').toLowerCase()
            );

            // Validate transaction data before conversion
            if (transaction.amount === null || transaction.amount === undefined) {
              console.warn('Transaction with missing amount:', transaction);
            }
            if (!transaction.type) {
              console.warn('Transaction with missing type:', transaction);
            }

            const amount = convertAmount(
              transaction.amount, 
              transaction.type,
              transaction.payee
            );

            // Log transaction details for debugging
            console.log('Processing transaction:', {
              payee: transaction.payee,
              originalAmount: transaction.amount,
              originalType: transaction.type,
              convertedAmount: amount
            });

            return {
              accountId: accountId as string,
              amount,
              payee: transaction.payee || 'Unknown Payee',
              date: new Date(transaction.date || new Date()),
              notes: transaction.notes || `Added via PDF scan (${transaction.type?.toLowerCase() || 'unknown'})`,
              categoryId: category?.id
            };
          });

          // Validate all transactions have correct signs
          const hasInvalidSigns = transformedData.some(transaction => {
            const isExpenseWithPositiveAmount = transaction.payee.toUpperCase().includes('PAYMENT') && transaction.amount > 0;
            const isIncomeWithNegativeAmount = transaction.payee.toUpperCase().includes('RECEIVED') && transaction.amount < 0;
            return isExpenseWithPositiveAmount || isIncomeWithNegativeAmount;
          });

          if (hasInvalidSigns) {
            console.warn('Found transactions with potentially incorrect signs:', 
              transformedData.filter(t => 
                (t.payee.toUpperCase().includes('PAYMENT') && t.amount > 0) ||
                (t.payee.toUpperCase().includes('RECEIVED') && t.amount < 0)
              )
            );
          }

          // Create transactions
          await createTransactions.mutateAsync(transformedData);
          console.log(`Successfully processed ${file.name}`);
          toast.success(`Successfully processed ${file.name}!`);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`Error processing file ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}. ${errorMessage}`);
        }
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in processPDFDocuments:', error);
      toast.error(`Failed to process PDF documents. ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      setCurrentFile(null);
      setPendingFiles([]);
      setProcessingProgress({ current: 0, total: 0 });
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!currentFile) return;
    
    try {
      console.log('Processing password-protected file:', currentFile.name);
      await processPDFDocuments([currentFile], password);
    } catch (error) {
      console.error('Error in password submission:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if all files are PDFs
    const allPDFs = Array.from(files).every(file => file.type === 'application/pdf');
    if (!allPDFs) {
      toast.error("Please upload only PDF files");
      return;
    }

    // Convert FileList to array for easier handling
    const fileArray = Array.from(files);
    setPendingFiles(fileArray);

    console.log('Files selected:', fileArray.map(f => f.name));

    // Check each file for password protection
    for (const file of fileArray) {
      console.log(`Checking if ${file.name} is password protected...`);
      const isProtected = await isPdfPasswordProtected(file);
      console.log(`${file.name} password protected:`, isProtected);
      
      if (isProtected) {
        setCurrentFile(file);
        setPasswordDialogOpen(true);
        return;
      }
    }

    // If no password protected files, process normally
    console.log('Processing files without password...');
    await processPDFDocuments(fileArray);
    
    // Clear the input
    event.target.value = '';
  };

  return (
    <>
      <AccountDialog />
      <PdfPasswordDialog
        isOpen={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setCurrentFile(null);
          setPendingFiles([]);
        }}
        onSubmit={handlePasswordSubmit}
        fileName={currentFile?.name || ""}
      />
      <div>
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          id="pdf-upload"
          onChange={handleFileSelect}
        />
        <Button
          size="sm"
          className="w-full lg:w-full"
          onClick={() => document.getElementById('pdf-upload')?.click()}
          disabled={isProcessing}
        >
          <FileText className="mr-2 size-4" />
          {isProcessing 
            ? `Processing... ${processingProgress.current}/${processingProgress.total}`
            : 'Upload PDF Documents'}
        </Button>
      </div>
    </>
  );
};