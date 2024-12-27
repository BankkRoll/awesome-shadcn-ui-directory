import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortProps {
  onSort: (sortBy: "name" | "category") => void;
}

export default function Sort({ onSort }: SortProps) {
  return (
    <Select onValueChange={onSort}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name">Name</SelectItem>
        <SelectItem value="category">Category</SelectItem>
      </SelectContent>
    </Select>
  );
}
