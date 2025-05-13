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
import { AccountForm } from "@/features/accounts/components/account-form";
import { z } from "zod";
import { insertAccountSchema } from "@/db/schema";

type SuggestedAccount = {
  accountName: string | null;
  institutionName: string | null;
  accountNumber: string | null;
  accountType: string | null;
};

type ConfirmOptions = {
  suggestedAccount?: SuggestedAccount;
};

type FormValues = z.input<typeof insertAccountSchema>;

export const useSelectAccount = (): [
  () => JSX.Element,
  (options?: ConfirmOptions) => Promise<unknown>,
] => {
  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const [suggestedAccount, setSuggestedAccount] = useState<SuggestedAccount | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

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
    setIsCreatingAccount(false);
  };

  const handleConfirm = () => {
    promise?.resolve(selectValue.current);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(undefined);
    handleClose();
  };

  const handleCreateAccount = () => {
    setIsCreatingAccount(true);
  };

  const handleAccountFormSubmit = async (values: FormValues) => {
    try {
      const response = await accountMutation.mutateAsync({
        name: values.name,
        institutionName: values.institutionName,
        accountNumber: values.accountNumber,
        currency: values.currency || "KES",
      });
      // After creating the account, select it automatically
      selectValue.current = response.data.id;
      handleConfirm();
    } catch (error) {
      // Error is handled by the mutation itself
      setIsCreatingAccount(false);
    }
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

          {isCreatingAccount ? (
            <AccountForm
              onSubmit={handleAccountFormSubmit}
              disabled={accountMutation.isPending}
              defaultValues={{
                name: suggestedAccount?.accountName || '',
                institutionName: suggestedAccount?.institutionName || '',
                accountNumber: suggestedAccount?.accountNumber || '',
                currency: 'KES',
              }}
            />
          ) : (
            <>
              <Select
                placeholder="Select an account"
                options={accountOptions}
                onChange={(value) => (selectValue.current = value)}
                disabled={accountQuery.isLoading || accountMutation.isPending}
              />

              <DialogFooter className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  onClick={handleCreateAccount}
                  variant="outline"
                >
                  Create New Account
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm}>
                    Confirm
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmationDialog, confirm];
};