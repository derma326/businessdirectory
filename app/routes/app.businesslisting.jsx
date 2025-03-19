import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, DataTable, Text } from "@shopify/polaris";
import db from "../db.server";

// Loader function to fetch categories
export async function loader() {
  // Fetch categories from the database
  const categories = await db.categories.findMany({
    orderBy: {
      id: "desc", // Assuming 'id' is auto-incremented
    },
  });
  
  return json(categories);
}

// Categories List Page
export default function CategoriesPage() {
  const categories = useLoaderData(); // Get data from loader

  // Format data for DataTable
  const rows = categories.map((category, index) => [
    index + 1,
    category.categoryName,
    category.categorySlug,
  ]);

  return (
    <Page title="Categories List">
      <Card>
        <Text as="h3" variant="headingMd" padding="400">
          Categories
        </Text>
        <DataTable
          columnContentTypes={["numeric", "text", "text"]}
          headings={["#", "Category Name", "Slug"]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}
