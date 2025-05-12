import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";

type AccountColumnProps = {
  account: string;
  accountId: string;
  institutionName: string;
  accountNumber?: string;
  currency: string;
};

export const AccountColumn = ({ 
  account, 
  accountId, 
  institutionName,
  accountNumber,
  currency
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
      <div className="text-xs text-muted-foreground">
        {accountNumber && <span>#{accountNumber} • </span>}
        <span>{currency}</span>
      </div>
    </button>
  );
};