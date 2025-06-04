import { FileText } from "lucide-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { isPdfPasswordProtected } from "@/lib/pdf-utils";
import { extractPdfContent } from "@/lib/pdf-api";
import { PdfPasswordDialog } from "@/components/pdf-password-dialog";

type PDFUploadButtonProps = {
  onUpload?: (results: any) => void;
  onClose: () => void;
};

type GeminiResponse = {
  transactions: Array<{
    date: string;
    payee: string;
    amount: number;
    type: string;
    notes?: string;
    category: string;
  }>;
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

  const cleanJsonResponse = (text: string) => {
    console.log('Raw Gemini response:', text);
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('Cleaned JSON from Gemini:', jsonMatch[1]);
      return jsonMatch[1];
    }
    console.log('No JSON blocks found, using raw text:', text);
    return text;
  };

  const convertAmount = (amount: number, type: string): number => {
    const amountStr = amount.toFixed(2);
    const cents = parseInt(amountStr.replace('.', ''));
    return type === "EXPENSE" ? -cents : cents;
  };

  const processWithGeminiAI = async (pdfContent: string) => {
    try {
      console.log('PDF content being sent to Gemini:', pdfContent);

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const availableCategories = categories.map(cat => ({
        name: cat.name,
        description: cat.description,
        id: cat.id
      }));

      console.log('Available categories for Gemini:', availableCategories);

      const prompt = `Analyze this PDF financial document content and extract transaction and account details. The content is pre-extracted text from a financial document (which may be a bank statement, invoice, or other financial record).

      Return the results in JSON format with the following structure:
      {
        "accountInfo": {
          "institutionName": "detected institution name or null",
          "accountNumber": "detected account number or null",
          "accountType": "detected account type or null (e.g. checking, savings, credit card, etc.)"
        },
        "transactions": [
          {
            "date": "YYYY-MM-DD",
            "payee": "name of payer/payee",
            "amount": total amount as a number with exact precision (e.g., 17000.00 should be 17000.00, 56 should be 56.00),
            "type": "EXPENSE" or "INCOME",
            "notes": "Include document type (statement/invoice), document number if available, and relevant details",
            "category": "name of the most appropriate category from the list below"
          }
        ]
      }

      Available categories:
      ${JSON.stringify(availableCategories, null, 2)}

      PDF Content to analyze:
      ${pdfContent}`;

      console.log('Sending prompt to Gemini:', prompt);

      const result = await model.generateContent([prompt]);
      console.log('Raw Gemini result:', result);

      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response text:', text);
      return text;
    } catch (error) {
      console.error('Error in Gemini processing:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
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
          console.log('Content extracted from FastAPI:', pdfContent);
          
          // Process the extracted content with Gemini AI
          console.log('Processing with Gemini AI...');
          const geminiResponse = await processWithGeminiAI(pdfContent);
          
          // Parse and clean the response
          const cleanedJson = cleanJsonResponse(geminiResponse);
          
          try {
            const parsedData = JSON.parse(cleanedJson) as GeminiResponse & {
              accountInfo: {
                accountName: string | null;
                institutionName: string | null;
                accountNumber: string | null;
                accountType: string | null;
              };
            };
            console.log('Parsed data from Gemini:', parsedData);

            // Get account selection from user
            const accountId = await confirm({
              suggestedAccount: parsedData.accountInfo
            });
            
            if (!accountId) {
              console.log('User cancelled account selection');
              toast.error("Please select an account to continue.");
              return;
            }

            console.log('Selected account ID:', accountId);

            // Transform the data
            const transformedData = parsedData.transactions.map(transaction => {
              const category = categories.find(cat => 
                cat.name.toLowerCase() === transaction.category.toLowerCase()
              );

              console.log('Processing transaction:', {
                original: transaction,
                matchedCategory: category
              });

              return {
                accountId: accountId as string,
                amount: convertAmount(transaction.amount, transaction.type),
                payee: transaction.payee,
                date: new Date(transaction.date),
                notes: transaction.notes || `Added via PDF scan (${transaction.type.toLowerCase()})`,
                categoryId: category?.id
              };
            });

            console.log('Transformed transactions:', transformedData);

            // Create transactions
            await createTransactions.mutateAsync(transformedData);
            console.log(`Successfully processed ${file.name}`);
            toast.success(`Successfully processed ${file.name}!`);
          } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
            console.error('Failed JSON:', cleanedJson);
            throw new Error('Failed to parse Gemini response');
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            });
          }
          toast.error(`Failed to process ${file.name}. Please try again.`);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error in processPDFDocuments:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      toast.error("Failed to process PDF documents. Please try again.");
    } finally {
      setIsProcessing(false);
      setCurrentFile(null);
      setPendingFiles([]);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!currentFile) return;
    
    try {
      console.log('Processing password-protected file:', currentFile.name);
      await processPDFDocuments([currentFile], password);
    } catch (error) {
      console.error('Error in password submission:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error; // Re-throw to be handled by the dialog
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
          {isProcessing ? 'Processing...' : 'Upload PDF Documents'}
        </Button>
      </div>
    </>
  );
}; 