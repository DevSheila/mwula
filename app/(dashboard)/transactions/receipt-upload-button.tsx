import { Camera } from "lucide-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";

type ReceiptUploadButtonProps = {
  onUpload?: (results: any) => void;
};

type GeminiResponse = {
  transactions: Array<{
    date: string;
    payee: string;
    amount: number;
    notes?: string;
    type: string;
  }>;
};

export const ReceiptUploadButton = ({ onUpload }: ReceiptUploadButtonProps) => {
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

  const processReceipts = async (files: FileList) => {
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
      const prompt = `Extract transaction details from these receipts. Return the results in JSON format with the following structure:
      {
        "transactions": [
          {
            "date": "YYYY-MM-DD",
            "payee": "store name",
            "amount": total amount in decimal format (e.g. 154.06),
            "type": "EXPENSE" or "INCOME",
            "notes": "Include receipt number and items if available"
          }
        ]
      }
      For transactions where money is being paid out (purchases, bills, etc.), mark type as "EXPENSE".
      For transactions where money is being received (refunds, payments received, income, etc.), mark type as "INCOME".
      `;
      
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
        // Convert amount to negative for expenses, positive for income
        amount: Math.round((transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount) * 100), // Convert to cents
        payee: transaction.payee,
        date: new Date(transaction.date),
        notes: transaction.notes || `Added via receipt scan (${transaction.type.toLowerCase()})`
      }));

      // Create the transactions
      createTransactions.mutate(transformedData, {
        onSuccess: () => {
          toast.success(`Successfully processed ${files.length} receipt(s)!`);
        },
        onError: (error) => {
          console.error('Error creating transactions:', error);
          toast.error("Failed to create transactions. Please try again.");
        }
      });

    } catch (error) {
      console.error('Error processing receipts:', error);
      toast.error("Failed to process receipts. Please try again.");
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

    await processReceipts(files);
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
          id="receipt-upload"
          onChange={handleFileSelect}
        />
        <Button
          size="sm"
          className="w-full lg:w-auto"
          onClick={() => document.getElementById('receipt-upload')?.click()}
          disabled={isProcessing}
        >
          <Camera className="mr-2 size-4" />
          {isProcessing ? 'Processing...' : 'Scan Receipts'}
        </Button>
      </div>
    </>
  );
}; 