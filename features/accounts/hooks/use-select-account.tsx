import { useRef, useState } from "react";

import { Select } from "@/components/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

type SuggestedAccount = {
  accountName: string | null;
  institutionName: string | null;
  accountNumber: string | null;
  accountType: string | null;
};

type ConfirmOptions = {
  suggestedAccount?: SuggestedAccount;
};

export const useSelectAccount = (): [
  () => JSX.Element,
  (options?: ConfirmOptions) => Promise<unknown>,
] => {
  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const [suggestedAccount, setSuggestedAccount] = useState<SuggestedAccount | null>(null);

  const onCreateAccount = (name: string) => {
    // If we have suggested account info, use it when creating the account
    if (suggestedAccount) {
      return accountMutation.mutate({
        name: name || suggestedAccount.accountName || '',
        institutionName: suggestedAccount.institutionName || 'Unknown Institution',
        accountNumber: suggestedAccount.accountNumber || '',
      });
    }
    return accountMutation.mutate({ name });
  };

  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: `${account.name} (${account.institutionName}${account.accountNumber ? ` - #${account.accountNumber}` : ''})`,
    value: account.id,
  }));

  const [promise, setPromise] = useState<{
    resolve: (value: string | undefined) => void;
  } | null>(null);

  const selectValue = useRef<string>();

  const confirm = (options?: ConfirmOptions) => {
    // Store suggested account info if provided
    if (options?.suggestedAccount) {
      setSuggestedAccount(options.suggestedAccount);
    } else {
      setSuggestedAccount(null);
    }
    
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
    setSuggestedAccount(null);
  };

  const handleConfirm = () => {
    promise?.resolve(selectValue.current);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(undefined);
    handleClose();
  };

  const ConfirmationDialog = () => {
    const suggestedAccountText = suggestedAccount ? 
      `Detected Account: ${suggestedAccount.accountName || ''} - ${suggestedAccount.institutionName || ''}${suggestedAccount.accountNumber ? ` (#${suggestedAccount.accountNumber})` : ''}` : 
      '';

    return (
      <Dialog open={promise !== null} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Account</DialogTitle>
            <DialogDescription>
              {suggestedAccountText ? (
                <>
                  {suggestedAccountText}
                  <br />
                  Please select an existing account or create a new one using the detected information.
                </>
              ) : (
                "Please select an account to continue."
              )}
            </DialogDescription>
          </DialogHeader>

          <Select
            placeholder="Select an account"
            options={accountOptions}
            onCreate={onCreateAccount}
            onChange={(value) => (selectValue.current = value)}
            disabled={accountQuery.isLoading || accountMutation.isPending}
            defaultValue={suggestedAccount?.accountName || ''}
          />

          <DialogFooter className="pt-2">
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmationDialog, confirm];
};