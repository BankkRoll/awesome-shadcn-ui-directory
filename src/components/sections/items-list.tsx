"use client";

import {
  AnimatePresence,
  motion,
  useAnimation,
  useReducedMotion,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ItemCard from "../item-card";
import { MultiSelect } from "../ui/multi-select";
import Sort from "../sort";
import { useDebounce } from "@/hooks/use-debounce";

interface Item {
  title: string;
  description: string;
  url: string;
  category: string;
}

interface Category {
  title: string;
  items: Item[];
}

interface ItemListProps {
  items: Item[];
  categories: Category[];
}

const ITEMS_PER_PAGE_OPTIONS = [18, 27, 36, 45];

export default function ItemList({
  items: initialItems,
  categories,
}: ItemListProps) {
  const [filteredItems, setFilteredItems] = useState<Item[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [direction, setDirection] = useState(0);

  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.title,
        value: category.title,
      })),
    [categories],
  );

  const filterAndSortItems = useCallback(() => {
    let filtered = initialItems;

    if (debouncedSearchQuery) {
      const lowercaseQuery = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.description.toLowerCase().includes(lowercaseQuery),
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category),
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else {
        return a.category.localeCompare(b.category);
      }
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [initialItems, debouncedSearchQuery, selectedCategories, sortBy]);

  useEffect(() => {
    filterAndSortItems();
  }, [filterAndSortItems]);

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      setDirection(pageNumber > currentPage ? 1 : -1);
      setCurrentPage(pageNumber);
    },
    [currentPage],
  );

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const containerVariants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 20 : -20,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -20 : 20,
      transition: {
        staggerChildren: 0.05,
      },
    }),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
    >
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
        variants={fadeInVariants}
      >
        <Input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64"
        />{" "}
        <div className="w-full sm:w-auto flex flex-row items-center gap-4">
          <MultiSelect
            options={categoryOptions}
            onValueChange={setSelectedCategories}
            placeholder="Filter by category"
            className="w-full sm:w-64"
          />
          <Sort onSort={setSortBy} />
        </div>
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {currentItems.map((item, index) => (
            <motion.div key={item.title + index} variants={itemVariants}>
              <ItemCard
                title={item.title}
                description={item.description}
                url={item.url}
                category={item.category}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0"
        variants={fadeInVariants}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((number) => (
                <SelectItem key={number} value={number.toString()}>
                  {number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
      <motion.div
        className="text-sm text-muted-foreground text-center"
        variants={fadeInVariants}
      >
        Showing {indexOfFirstItem + 1} -{" "}
        {Math.min(indexOfLastItem, filteredItems.length)} of{" "}
        {filteredItems.length} items
      </motion.div>
    </motion.div>
  );
}
