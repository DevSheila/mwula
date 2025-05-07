import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { toast } from "sonner";

type CategoryColumnProps = {
  id: string;
  category: string | null;
  categoryId: string | null;
  isUniversal?: number;
};

export const CategoryColumn = ({
  id,
  category,
  categoryId,
  isUniversal,
}: CategoryColumnProps) => {
  const { onOpen: onOpenCategory } = useOpenCategory();
  const { onOpen: onOpenTransaction } = useOpenTransaction();

  const onClick = () => {
    if (categoryId) {
      if (isUniversal === 1) {
        toast.error("Cannot edit universal categories.");
        return;
      }
      onOpenCategory(categoryId);
    } else {
      onOpenTransaction(id);
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center hover:underline",
        !category && "text-rose-500",
        isUniversal === 1 && "cursor-not-allowed opacity-70"
      )}
    >
      {!category && <TriangleAlert className="mr-2 size-4 shrink-0" />}
      {category || "Uncategorized"}
    </button>
  );
};