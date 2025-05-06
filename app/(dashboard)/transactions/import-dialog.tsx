import { Upload, FileImage, FileText } from "lucide-react";
import { useCSVReader } from "react-papaparse";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploadButton } from "./image-upload-button";
import { PDFUploadButton } from "./pdf-upload-button";
import { DocumentUploadSection } from "./document-upload-section";
import { UploadButton } from "./upload-button";

type ImportDialogProps = {
    onUpload: (results: any) => void;
};

export const ImportDialog = ({ onUpload }: ImportDialogProps) => {
    const { CSVReader } = useCSVReader();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full lg:w-auto">
                    <Upload className="mr-2 size-4" />
                    Import Transactions
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import Transactions</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <DocumentUploadSection />
                    <UploadButton onUpload={onUpload} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
