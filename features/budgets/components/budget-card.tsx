import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import { 
  FaShoppingCart, 
  FaCar, 
  FaHome, 
  FaUtensils, 
  FaPlane, 
  FaShoppingBag,
  FaRegCreditCard,
  FaGraduationCap,
  FaHeartbeat,
  FaGamepad
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const CATEGORY_ICONS: { [key: string]: IconType } = {
  'Groceries': FaShoppingCart,
  'Transport': FaCar,
  'Housing': FaHome,
  'Dining': FaUtensils,
  'Travel': FaPlane,
  'Shopping': FaShoppingBag,
  'Bills': FaRegCreditCard,
  'Education': FaGraduationCap,
  'Healthcare': FaHeartbeat,
  'Entertainment': FaGamepad,
};

interface BudgetCardProps {
  id: string;
  name: string | null;
  categories: Array<{ id: string; name: string }>;
  amount: number;
  spent: number;
  remaining: number;
  progress: number;
  startDate: string;
  endDate: string;
  period: "monthly" | "weekly" | "yearly";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BudgetCard = ({
  id,
  name,
  categories,
  amount,
  spent,
  remaining,
  progress,
  startDate,
  endDate,
  period,
  onEdit,
  onDelete,
}: BudgetCardProps) => {
  const router = useRouter();

  // Get the first category name for icon selection
  const primaryCategory = categories[0]?.name || '';
  const Icon = CATEGORY_ICONS[primaryCategory] || FaShoppingBag;

  // Determine status and styling
  const getStatus = () => {
    if (progress === 0) return { text: "Not started", color: "text-muted-foreground", progressColor: "bg-muted" };
    if (remaining < 0) return { text: "Over budget", color: "text-destructive", progressColor: "bg-destructive" };
    if (progress >= 80) return { text: "Near limit", color: "text-amber-500", progressColor: "bg-amber-500" };
    return { text: "Under budget", color: "text-emerald-500", progressColor: "bg-emerald-500" };
  };

  const status = getStatus();

  const handleAction = (e: React.MouseEvent, action: (id: string) => void) => {
    e.stopPropagation();
    action(id);
  };

  const formatDateRange = () => {
    const start = format(new Date(startDate), "MMM d, yyyy");
    const end = format(new Date(endDate), "MMM d, yyyy");
    return `${start} - ${end}`;
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer",
        "border border-border/50 hover:border-border/100"
      )}
      onClick={() => router.push(`/budgets/${id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              {name || categories[0]?.name || "Untitled Budget"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {formatDateRange()}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                router.push(`/budgets/${id}`);
              }}>
                <FileText className="mr-2 size-4" />
                View Transactions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, onEdit!)}>
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => handleAction(e, onDelete!)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <Badge 
              key={category.id} 
              variant="secondary"
              className="text-xs"
            >
              {category.name}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs capitalize">
            {period}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Budget</span>
            <span className="text-sm font-medium">{formatCurrency(amount)}</span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Spent</span>
            <span className="text-sm font-medium">{formatCurrency(spent)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={cn("text-sm font-medium", status.color)}>
                {status.text}
              </span>
              <span className={cn("text-sm font-medium", status.color)}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={Math.min(progress, 100)} 
              className="h-2"
              indicatorClassName={cn(
                status.progressColor,
                "transition-all"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};