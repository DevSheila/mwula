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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const onCreateAccount = async (values: { name: string; institutionName: string; accountNumber: string; currency: string }) => {
    const result = await accountMutation.mutateAsync(values);
    selectValue.current = result.data.id;
    setShowCreateForm(false);
    handleConfirm();
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
    setShowCreateForm(false);
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

          {!showCreateForm ? (
            <>
              <Select
                placeholder="Select an account"
                options={accountOptions}
                onChange={(value) => (selectValue.current = value)}
                disabled={accountQuery.isLoading || accountMutation.isPending}
              />

              <Button 
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="w-full"
              >
                Create New Account
              </Button>

              <DialogFooter className="pt-2">
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={!selectValue.current}>
                  Confirm
                </Button>
              </DialogFooter>
            </>
          ) : (
            <AccountForm
              onSubmit={onCreateAccount}
              disabled={accountMutation.isPending}
              defaultValues={{
                name: suggestedAccount?.accountName || "",
                institutionName: suggestedAccount?.institutionName || "",
                accountNumber: suggestedAccount?.accountNumber || "",
                currency: "KES", // Default to KES since it's a Kenyan app
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmationDialog, confirm];
};