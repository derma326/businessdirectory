import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, DataTable, Text } from "@shopify/polaris";
import db from "../db.server";

// Loader function to fetch Listing
export async function loader() {
  // Fetch Listing from the database
  const listing = await db.businessDirectory.findMany({
    orderBy: {
      id: "desc", // Assuming 'id' is auto-incremented
    },
  });
  
    // Convert BigInt to Number
    const formattedListing = listing.map((item) => ({
        ...item,
        id: Number(item.id), // Convert BigInt to Number
      }));

  return json(formattedListing);
}

// Business Listing Page
export default function BusinessListingPage() {
  const listing = useLoaderData(); // Get data from loader

  // Format data for DataTable
  const rows = listing.map((businesslist, index) => [
    index + 1,
    businesslist.listingTitle,
    businesslist.email,
  ]);

  return (
    <Page title="Listing List">
      <Card>
        <Text as="h3" variant="headingMd" padding="400">
          Listing
        </Text>
        <DataTable
          columnContentTypes={["numeric", "text", "text"]}
          headings={["#", "Listing Title", "Email"]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}
