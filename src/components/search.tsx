import { Input } from "@/components/ui/input";

interface SearchProps {
  onSearch: (query: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  return (
    <Input
      type="search"
      placeholder="Search..."
      onChange={(e) => onSearch(e.target.value)}
      className="max-w-sm"
    />
  );
}
