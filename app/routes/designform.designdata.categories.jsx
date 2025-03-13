import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader() {
  try {
    const categories = await db.categories.findMany({
      select: {
        id: true,
        categoryName: true,
        categorySlug: true,
      },
    });

    return json(categories);
  } catch (error) {
    console.error("Database Error:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
