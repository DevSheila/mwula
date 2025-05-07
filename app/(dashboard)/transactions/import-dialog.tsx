import { Upload, FileImage, FileText } from "lucide-react";
import { useCSVReader } from "react-papaparse";
import { useState } from "react";

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
    const [open, setOpen] = useState(false);
    const { CSVReader } = useCSVReader();

    const handleClose = () => setOpen(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                    <DocumentUploadSection onClose={handleClose} />
                    <UploadButton onUpload={(results) => {
                        onUpload(results);
                        handleClose();
                    }} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
