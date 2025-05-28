import { FileText } from "lucide-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { PDFPasswordDialog } from "./pdf-password-dialog";
import { isPDFPasswordProtected, decryptPDF, convertPDFToBase64 } from "@/lib/pdf-utils";

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

type PasswordProtectedFile = {
  file: File;
  index: number;
};

export const PDFUploadButton = ({ onUpload, onClose }: PDFUploadButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [AccountDialog, confirm] = useSelectAccount();
  const createTransactions = useBulkCreateTransactions();
  const { data: categories = [] } = useGetCategories();
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    file: PasswordProtectedFile | null;
    remainingFiles: File[];
  }>({
    isOpen: false,
    file: null,
    remainingFiles: [],
  });

  const cleanJsonResponse = (text: string) => {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1];
    }
    return text;
  };

  const convertAmount = (amount: number, type: string): number => {
    // Convert the amount to a string with 2 decimal places
    const amountStr = amount.toFixed(2);
    // Remove the decimal point and convert back to number
    const cents = parseInt(amountStr.replace('.', ''));
    // Apply the sign based on transaction type
    return type === "EXPENSE" ? -cents : cents;
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      if (!passwordDialog.file) return;

      // Attempt to decrypt the PDF
      const decryptedBuffer = await decryptPDF(passwordDialog.file.file, password);
      
      // Create a new File object with the decrypted content
      const decryptedFile = new File([decryptedBuffer], passwordDialog.file.file.name, {
        type: 'application/pdf'
      });

      // Replace the encrypted file with the decrypted one
      const updatedFiles = [...passwordDialog.remainingFiles];
      updatedFiles[passwordDialog.file.index] = decryptedFile;

      // Close the password dialog
      setPasswordDialog({ isOpen: false, file: null, remainingFiles: [] });
      
      // Continue processing with the decrypted file
      await processPDFDocuments(updatedFiles);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid password') {
          toast.error('Invalid password. Please try again.');
        } else {
          toast.error('Failed to decrypt PDF. Please try again.');
          console.error('Decryption error:', error);
        }
      }
    }
  };

  const processPDFDocuments = async (files: File[]) => {
    try {
      setIsProcessing(true);
      
      // Check each PDF for password protection
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isEncrypted = await isPDFPasswordProtected(file);
        
        if (isEncrypted) {
          setPasswordDialog({
            isOpen: true,
            file: { file, index: i },
            remainingFiles: files,
          });
          return; // Stop processing and wait for password
        }
      }
      
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert PDFs to base64
      const filePromises = files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return {
          inlineData: {
            mimeType: file.type,
            data: base64
          }
        };
      });

      const fileData = await Promise.all(filePromises);

      // Create a list of available categories for the AI
      const availableCategories = categories.map(cat => ({
        name: cat.name,
        description: cat.description,
        id: cat.id
      })); 
      
      const prompt = `Analyze these PDF financial documents (which may include bank statements, invoices, or other financial records) and extract transaction and account details. Return the results in JSON format with the following structure:
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

      Guidelines:
      - Extract any visible account information (name, institution, number, type) from headers, footers, or metadata
      - For statements: extract account details from the statement header
      - For statements: extract each transaction with its corresponding payee
      - For invoices: payee is the billing entity
      - Choose the most appropriate category from the provided list based on the transaction details
      - IMPORTANT: Preserve exact amount values. Do not round or modify the amounts.
      
      Transaction Types:
      - EXPENSE: Money going out (debits, payments made, bills)
      - INCOME: Money coming in (credits, payments received, deposits)
      
      Please be thorough in the notes field to indicate the type of document processed.`;
      
      const result = await model.generateContent([
        prompt,
        ...fileData
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log("Raw text response:", text);
      
      const cleanedJson = cleanJsonResponse(text);
      console.log("Cleaned JSON:", cleanedJson);
      
      const parsedData = JSON.parse(cleanedJson) as GeminiResponse & {
        accountInfo: {
          accountName: string | null;
          institutionName: string | null;
          accountNumber: string | null;
          accountType: string | null;
        };
      };

      // Get account selection from user with suggested account
      const accountId = await confirm({
        suggestedAccount: parsedData.accountInfo
      });
      
      if (!accountId) {
        toast.error("Please select an account to continue.");
        return;
      }

      // Transform the data
      const transformedData = parsedData.transactions.map(transaction => {
        // Find the category ID based on the name
        const category = categories.find(cat => 
          cat.name.toLowerCase() === transaction.category.toLowerCase()
        );

        return {
          accountId: accountId as string,
          amount: convertAmount(transaction.amount, transaction.type),
          payee: transaction.payee,
          date: new Date(transaction.date),
          notes: transaction.notes || `Added via PDF scan (${transaction.type.toLowerCase()})`,
          categoryId: category?.id // Include the category ID if found
        };
      });

      // Create the transactions
      createTransactions.mutate(transformedData, {
        onSuccess: () => {
          toast.success(`Successfully processed ${files.length} PDF document(s)!`);
          onClose();
        },
        onError: (error) => {
          console.error('Error creating transactions:', error);
          toast.error("Failed to create transactions. Please try again.");
        }
      });

    } catch (error) {
      console.error('Error processing PDF documents:', error);
      toast.error("Failed to process PDF documents. Please try again.");
    } finally {
      setIsProcessing(false);
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

    await processPDFDocuments(Array.from(files));
    // Clear the input
    event.target.value = '';
  };

  return (
    <>
      <AccountDialog />
      <PDFPasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog({ isOpen: false, file: null, remainingFiles: [] })}
        onSubmit={handlePasswordSubmit}
        fileName={passwordDialog.file?.file.name || ""}
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