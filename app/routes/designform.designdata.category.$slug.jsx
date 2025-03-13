import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import db from "../db.server";

export async function loader({ params, request }) {
  const { slug } = params;
  const url = new URL(request.url);

  try {
    const category = await db.categories.findFirst({
      where: { categorySlug: slug },
      include: { businessListings: true }, // Fetch business listings
    });

    if (!category) {
      return json({ error: "Category not found." }, { status: 404 });
    }

    // Sort businessListings in descending order
    const sortedListings = category.businessListings.sort(
      (a, b) => b.id - a.id
    );

    // Convert BigInt fields to strings
    const serializedCategory = {
      ...category,
      businessListings: sortedListings.map((listing) => ({
        ...listing,
        userId: listing.userId.toString(),
      })),
    };

    // ** Ensure JSON response when requested **
    if (
      request.headers.get("accept")?.includes("application/json") ||
      url.searchParams.get("format") === "json"
    ) {
      return json({ category: serializedCategory });
    }

    // Default JSON response fallback
    return json({ category: serializedCategory });

  } catch (error) {
    console.error("Database Error:", error);
    return json({ error: "Failed to load category data." }, { status: 500 });
  }
}
