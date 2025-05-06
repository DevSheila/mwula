import { FileText } from "lucide-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";

type PDFUploadButtonProps = {
  onUpload?: (results: any) => void;
};

type GeminiResponse = {
  transactions: Array<{
    date: string;
    payee: string;
    amount: number;
    type: string;
    notes?: string;
  }>;
};

export const PDFUploadButton = ({ onUpload }: PDFUploadButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [AccountDialog, confirm] = useSelectAccount();
  const createTransactions = useBulkCreateTransactions();

  const cleanJsonResponse = (text: string) => {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1];
    }
    return text;
  };

  const processPDFDocuments = async (files: FileList) => {
    try {
      setIsProcessing(true);
      
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert PDFs to base64
      const filePromises = Array.from(files).map(async (file) => {
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
      
      const prompt = `Analyze these PDF financial documents (which may include bank statements, invoices, or other financial records) and extract transaction details. Return the results in JSON format with the following structure:
      {
        "transactions": [
          {
            "date": "YYYY-MM-DD",
            "payee": "name of payer/payee",
            "amount": total amount as is(e.g. 154.06 should be 154.06 , but 154 should be 154.00),
            "type": "EXPENSE" or "INCOME",
            "notes": "Include document type (statement/invoice), document number if available, and relevant details"
          }
        ]
      }

      Guidelines:
      - For statements: extract each transaction with its corresponding payee
      - For invoices: payee is the billing entity
      
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
      
      const parsedData = JSON.parse(cleanedJson) as GeminiResponse;

      // Get account selection from user
      const accountId = await confirm();
      if (!accountId) {
        toast.error("Please select an account to continue.");
        return;
      }

      // Transform the data
      const transformedData = parsedData.transactions.map(transaction => ({
        accountId: accountId as string,
        amount: Math.round(transaction.amount * (transaction.type === "EXPENSE" ? -100 : 100)),
        payee: transaction.payee,
        date: new Date(transaction.date),
        notes: transaction.notes || `Added via PDF scan (${transaction.type.toLowerCase()})`
      }));

      // Create the transactions
      createTransactions.mutate(transformedData, {
        onSuccess: () => {
          toast.success(`Successfully processed ${files.length} PDF document(s)!`);
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

    await processPDFDocuments(files);
    // Clear the input
    event.target.value = '';
  };

  return (
    <>
      <AccountDialog />
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