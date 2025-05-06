import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";

type DocumentUploadButtonProps = {
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

export const ImageUploadButton = ({ onUpload }: DocumentUploadButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [AccountDialog, confirm] = useSelectAccount();
  const createTransactions = useBulkCreateTransactions();

  const cleanJsonResponse = (text: string) => {
    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1];
    }
    return text;
  };

  const processDocuments = async (files: FileList) => {
    try {
      setIsProcessing(true);
      
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert all files to base64 and prepare them for Gemini
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
      
      // Prepare the prompt and files for Gemini
      const prompt = `Analyze these financial documents (which may include receipts, checks, invoices, or other financial records) and extract transaction details. Return the results in JSON format with the following structure:
      {
        "transactions": [
          {
            "date": "YYYY-MM-DD",
            "payee": "name of payer/payee",
            "amount": total amount as is(e.g. 154.06 should be 154.06 , but 154 should be 154.00),
            "type": "EXPENSE" or "INCOME",
            "notes": "Include document type (receipt/check/invoice), document number if available, and relevant details"
          }
        ]
      }

      Guidelines:
      - For checks: payee is who the check is written to/from
      - For receipts: payee is the merchant/store name
      - For invoices: payee is the billing entity
      
      Transaction Types:
      - EXPENSE: Money going out (purchases, payments made, bills)
      - INCOME: Money coming in (checks received, payments received, refunds)
      
      Please be thorough in the notes field to indicate the type of document processed.`;
      
      const result = await model.generateContent([
        prompt,
        ...fileData
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log("Raw text response:", text);
      
      // Clean and parse the JSON response
      const cleanedJson = cleanJsonResponse(text);
      console.log("Cleaned JSON:", cleanedJson);
      
      const parsedData = JSON.parse(cleanedJson) as GeminiResponse;

      // Get account selection from user
      const accountId = await confirm();
      if (!accountId) {
        toast.error("Please select an account to continue.");
        return;
      }

      // Transform the data into the format expected by the database
      const transformedData = parsedData.transactions.map(transaction => ({
        accountId: accountId as string,
        // Convert amount to cents and make negative for expenses
        amount: Math.round(transaction.amount * (transaction.type === "EXPENSE" ? -100 : 100)),
        payee: transaction.payee,
        date: new Date(transaction.date),
        notes: transaction.notes || `Added via document scan (${transaction.type.toLowerCase()})`
      }));

      // Create the transactions
      createTransactions.mutate(transformedData, {
        onSuccess: () => {
          toast.success(`Successfully processed ${files.length} document(s)!`);
        },
        onError: (error) => {
          console.error('Error creating transactions:', error);
          toast.error("Failed to create transactions. Please try again.");
        }
      });

    } catch (error) {
      console.error('Error processing documents:', error);
      toast.error("Failed to process documents. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if all files are images
    const allImages = Array.from(files).every(file => file.type.startsWith('image/'));
    if (!allImages) {
      toast.error("Please upload only image files");
      return;
    }

    await processDocuments(files);
    // Clear the input so the same files can be selected again if needed
    event.target.value = '';
  };

  return (
    <>
      <AccountDialog />
      <div>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id="document-upload"
          onChange={handleFileSelect}
        />
        <Button
          size="sm"
          className="w-full lg:w-full"
          onClick={() => document.getElementById('document-upload')?.click()}
          disabled={isProcessing}
        >
          <ImagePlus className="mr-2 size-4" />
          {isProcessing ? 'Processing...' : 'Upload Images'}
        </Button>
      </div>
    </>
  );
}; 