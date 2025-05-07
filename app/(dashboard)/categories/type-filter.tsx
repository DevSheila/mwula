import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TypeFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export const TypeFilter = ({ value, onChange }: TypeFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        <SelectItem value="user">Your Categories</SelectItem>
        <SelectItem value="universal">Universal Categories</SelectItem>
      </SelectContent>
    </Select>
  );
}; 