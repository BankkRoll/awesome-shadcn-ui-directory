import { useEffect, useState } from "react";

import Hero from "@/components/sections/hero";
import ItemList from "@/components/sections/items-list";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmitCTA } from "@/components/sections/cta-submit";
import { fetchAndParseReadme } from "@/hooks/use-readme";
import { motion } from "framer-motion";

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

const EXCLUDED_TITLES = ["Star History", "Contributors"];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedCategories = await fetchAndParseReadme();
        const filteredCategories = fetchedCategories.map((category) => ({
          ...category,
          items: category.items.filter(
            (item) => !EXCLUDED_TITLES.includes(item.title),
          ),
        }));
        setCategories(filteredCategories);
        setFilteredItems(
          filteredCategories.flatMap((category) => category.items),
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching README:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="container mx-auto max-w-7xl px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Hero />
      </motion.div>

      <motion.div variants={itemVariants} className="my-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-48" />
              ))}
            </div>
          </div>
        ) : (
          <ItemList items={filteredItems} categories={categories} />
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <SubmitCTA />
      </motion.div>
    </motion.div>
  );
}
