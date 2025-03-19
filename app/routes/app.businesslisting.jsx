import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useSubmit } from "@remix-run/react";
import { Page, Card, DataTable, Text, Button } from "@shopify/polaris";
import db from "../db.server";

// Loader function to fetch Listing
export async function loader() {
  // Fetch Listing from the database
  const listing = await db.businessDirectory.findMany({
    orderBy: { id: "desc" }, // Assuming 'id' is auto-incremented
  });

  // Convert BigInt fields to Number or String and map status
  const formattedListing = listing.map((item) => ({
    ...item,
    userId: item.userId ? item.userId.toString() : null, // Convert BigInt to String
    status: item.approve === 1 ? "Active" : "Inactive", // Convert approve status
  }));

  return json(formattedListing);
}

// Action function to update approval status
export async function action({ request }) {
  const formData = await request.formData();
  const id = parseInt(formData.get("id"), 10);
  const approve = formData.get("approve") === "1" ? 1 : 0;

  // Update the listing in the database
  await db.businessDirectory.update({
    where: { id },
    data: { approve },
  });

  return redirect("/business-listing"); // Reload the page after update
}

// Business Listing Page
export default function BusinessListingPage() {
  const listing = useLoaderData();
  const submit = useSubmit();

  // Format data for DataTable
  const rows = listing.map((businesslist, index) => [
    index + 1,
    businesslist.listingTitle,
    businesslist.email,
    businesslist.status,
    <Form method="post">
      <input type="hidden" name="id" value={businesslist.id} />
      <input type="hidden" name="approve" value={businesslist.status === "Active" ? "0" : "1"} />
      <Button
        size="slim"
        onClick={(e) => {
          e.preventDefault();
          submit(e.currentTarget.form);
        }}
      >
        {businesslist.status === "Active" ? "Disapprove" : "Approve"}
      </Button>
    </Form>,
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
