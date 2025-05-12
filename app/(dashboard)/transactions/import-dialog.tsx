import { Upload, FileImage, FileText, Plus } from "lucide-react";
import { useCSVReader } from "react-papaparse";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { ImageUploadButton } from "./image-upload-button";
import { PDFUploadButton } from "./pdf-upload-button";
import { DocumentUploadSection } from "./document-upload-section";
import { UploadButton } from "./upload-button";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts";

type ImportDialogProps = {
    onUpload: (results: any) => void;
};

export const ImportDialog = ({ onUpload }: ImportDialogProps) => {
    const [open, setOpen] = useState(false);
    const { CSVReader } = useCSVReader();
    const { data: accounts, isLoading } = useGetAccounts();
    const newAccount = useNewAccount();

    const handleClose = () => setOpen(false);

    const handleCreateAccount = () => {
        handleClose();
        newAccount.onOpen();
    };

    const hasAccounts = accounts && accounts.length > 0;

    return (
        <>
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
                        {!hasAccounts && (
                            <DialogDescription>
                                You need to create an account before you can import transactions.
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    {hasAccounts ? (
                        <div className="flex flex-col gap-4 py-4">
                            <DocumentUploadSection onClose={handleClose} />
                            <UploadButton onUpload={(results) => {
                                onUpload(results);
                                handleClose();
                            }} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 py-4">
                            <Button onClick={handleCreateAccount}>
                                <Plus className="mr-2 size-4" />
                                Create Account
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
