import { remark } from "remark";
import remarkParse from "remark-parse";

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

export async function fetchAndParseReadme(): Promise<Category[]> {
  const response = await fetch(
    "https://raw.githubusercontent.com/birobirobiro/awesome-shadcn-ui/main/README.md",
  );
  const text = await response.text();

  const tree = remark().use(remarkParse).parse(text);

  const categories: Category[] = [];
  let currentCategory: Category | null = null;

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2) {
      if (currentCategory) {
        categories.push(currentCategory);
      }
      currentCategory = {
        title: (node.children[0] as any).value,
        items: [],
      };
    } else if (node.type === "list" && currentCategory) {
      for (const listItem of (node as any).children) {
        const linkNode = listItem.children[0].children[0];
        const descriptionNode = listItem.children[0].children[1];

        if (linkNode && linkNode.type === "link") {
          const item: Item = {
            title: linkNode.children[0].value,
            url: linkNode.url,
            description: descriptionNode ? descriptionNode.value.trim() : "",
            category: currentCategory.title,
          };
          currentCategory.items.push(item);
        }
      }
    }
  }

  if (currentCategory) {
    categories.push(currentCategory);
  }

  return categories;
}
