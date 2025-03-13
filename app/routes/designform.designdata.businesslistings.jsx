import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }) {
  console.log("Incoming Request:", request.url);

  try {
    const listings = await db.businessDirectory.findMany({
        include: {
          category: true, // Fetch related category data
        },
      orderBy: {
        id: "desc", // Change to "desc" for descending order
      },
      });
      

    // Convert BigInt fields to strings
    const sanitizedListings = listings.map(item => ({
      ...item,
      id: item.id.toString(),
      userId: item.userId?.toString(),
      categoryId: item.categoryId?.toString(),
      categoryName: item.category.categoryName, // Add category name

    }));

    console.log("Fetched Listings:", sanitizedListings);
    
    return json(sanitizedListings);
  } catch (error) {
    console.error("Database Error:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
