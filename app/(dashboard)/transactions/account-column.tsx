import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";

type AccountColumnProps = {
  account: string;
  accountId: string;
  institutionName: string;
  accountNumber?: string;
};

export const AccountColumn = ({ 
  account, 
  accountId, 
  institutionName,
  accountNumber 
}: AccountColumnProps) => {
  const { onOpen: onOpenAccount } = useOpenAccount();

  const onClick = () => onOpenAccount(accountId);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start cursor-pointer group"
    >
      <span className="font-medium group-hover:underline">{account}</span>
      <span className="text-sm text-muted-foreground">{institutionName}</span>
      {accountNumber && (
        <span className="text-xs text-muted-foreground">#{accountNumber}</span>
      )}
    </button>
  );
};