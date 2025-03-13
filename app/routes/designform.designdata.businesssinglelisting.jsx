import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }) {
  console.log("Incoming Request:", request.url);

  // Extract slug from the URL query string
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  try {
    // If `slug` is provided, fetch that specific listing
    if (slug) {
      const listing = await db.businessDirectory.findFirst({
        where: { slug },
        include: {
          category: true, // Fetch related category data
        },
      });

      if (!listing) {
        return json({ error: "Listing not found" }, { status: 404 });
      }

      // Return the listing with sanitized fields
      return json({
        ...listing,
        id: listing.id.toString(),
        userId: listing.userId?.toString(),
        categoryId: listing.categoryId?.toString(),
        categoryName: listing.category.categoryName,
      });
    }

    // If no slug is provided, return all listings
    const listings = await db.businessDirectory.findMany({
      include: { category: true },
    });

    const sanitizedListings = listings.map((item) => ({
      ...item,
      id: item.id.toString(),
      userId: item.userId?.toString(),
      categoryId: item.categoryId?.toString(),
      categoryName: item.category.categoryName,
    }));

    console.log("Fetched Listings:", sanitizedListings);
    return json(sanitizedListings);
  } catch (error) {
    console.error("Database Error:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
