import { Camera } from "lucide-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ReceiptUploadButtonProps = {
  onUpload: (results: any) => void;
};

export const ReceiptUploadButton = ({ onUpload }: ReceiptUploadButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processReceipt = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      // Convert the file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      // Prepare the image for Gemini
      const prompt = "Extract transaction details from this receipt. Return the results in JSON format with the following fields: payee (store name), amount (in cents), date (YYYY-MM-DD format). If there are multiple items, just provide the total amount.";
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file.type,
            data: base64
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      const parsedData = JSON.parse(text);
      
      // Convert to the format expected by the application
      const transformedData = [{
        amount: parsedData.amount,
        payee: parsedData.payee,
        date: new Date(parsedData.date),
        notes: "Added via receipt scan"
      }];

      onUpload({
        data: transformedData,
        errors: [],
        meta: []
      });

    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    await processReceipt(file);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
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
        {isProcessing ? 'Processing...' : 'Scan Receipt'}
      </Button>
    </div>
  );
}; 