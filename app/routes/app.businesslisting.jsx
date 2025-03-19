import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Page, Card, DataTable, Text, Button } from "@shopify/polaris";
import { useState } from "react";
import db from "../db.server";

// 🟢 Loader function to fetch Listings
export async function loader() {
  const listing = await db.businessDirectory.findMany({
    orderBy: { id: "desc" },
  });

  const formattedListing = listing.map((item) => ({
    ...item,
    userId: item.userId ? item.userId.toString() : null,
    status: item.approve === 1 ? "Active" : "Inactive",
  }));

  return json(formattedListing);
}

// 🟢 Action function to handle Approve/Disapprove
export async function action({ request }) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get("id"), 10);
    const approve = formData.get("approve") === "1" ? 1 : 0;

    // Update the database
    await db.businessDirectory.update({
      where: { id },
      data: { approve },
    });

    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

// 🟢 Business Listing Page
export default function BusinessListingPage() {
  const listing = useLoaderData();
  const fetcher = useFetcher();
  const [loadingId, setLoadingId] = useState(null); // Track which button is loading

  const handleSubmit = (e, id) => {
    e.preventDefault();
    setLoadingId(id); // Set loading state for this button
    fetcher.submit(e.currentTarget.form);
  };

  const rows = listing.map((businesslist, index) => [
    index + 1,
    businesslist.listingTitle,
    businesslist.email,
    businesslist.status,
    <fetcher.Form method="post">
      <input type="hidden" name="id" value={businesslist.id} />
      <input type="hidden" name="approve" value={businesslist.status === "Active" ? "0" : "1"} />
      <Button
        size="slim"
        loading={loadingId === businesslist.id} // Only show loading for clicked button
        onClick={(e) => handleSubmit(e, businesslist.id)}
      >
        {businesslist.status === "Active" ? "Disapprove" : "Approve"}
      </Button>
    </fetcher.Form>,
  ]);

  return (
    <Page title="Listing List">
      <Card>
        <Text as="h3" variant="headingMd" padding="400">
          Listing
        </Text>
        <DataTable
          columnContentTypes={["numeric", "text", "text", "text", "text"]}
          headings={["#", "Listing Title", "Email", "Status", "Actions"]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}
