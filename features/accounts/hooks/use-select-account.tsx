import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AccountForm } from "@/features/accounts/components/account-form";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/select";
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

const formSchema = insertAccountSchema.pick({
  name: true,
  institutionName: true,
  accountNumber: true,
  currency: true,
});

type FormValues = z.infer<typeof formSchema>;

export const useSelectAccount = (): [
  () => JSX.Element,
  (options?: ConfirmOptions) => Promise<unknown>,
] => {
  const accountMutation = useCreateAccount();
  const accountQuery = useGetAccounts();

  const accountOptions = (accountQuery.data || []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  let promise: {
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  } | null = null;

  let selectValue = { current: "" };
  let suggestedAccount: SuggestedAccount | undefined;
  let isCreatingAccount = false;

  const confirm = (options?: ConfirmOptions) => {
    suggestedAccount = options?.suggestedAccount;
    return new Promise((resolve, reject) => {
      promise = { resolve, reject };
    });
  };

  const handleClose = () => {
    if (promise) {
      promise.reject();
      promise = null;
    }
  };

  const handleConfirm = () => {
    if (promise) {
      promise.resolve(selectValue.current);
      promise = null;
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleCreateAccount = () => {
    isCreatingAccount = true;
  };

  const handleAccountFormSubmit = async (values: FormValues) => {
    try {
      const response = await accountMutation.mutateAsync(values);
      // The response type from the API includes { data: { id: string, ... } }
      if ('data' in response) {
        selectValue.current = response.data.id;
        handleConfirm();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      // Error is handled by the mutation itself
      handleClose();
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
                onChange={(value) => {
                  if (typeof value === 'string') {
                    selectValue.current = value;
                  }
                }}
                disabled={accountQuery.isLoading || accountMutation.isPending}
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Create new account
                </button>

                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectValue.current}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmationDialog, confirm];
};