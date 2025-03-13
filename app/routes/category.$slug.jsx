import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }) {
  const { slug } = params;

  try {
    const response = await fetch(
      `https://dermaplanelumohs.myshopify.com/apps/proxy/category/${slug}`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      throw new Response("Category data not found", { status: 404 });
    }

    const data = await response.json();
    return json({ category: data.category });
  } catch (error) {
    console.error("Error fetching category data:", error);
    return json({ error: "Failed to load category data." }, { status: 500 });
  }
}

export default function CategoryPage() {
  const data = useLoaderData();

  if (!data || data.error || !data.category) {
    return <div className="error-message">⚠️ {data?.error || "Category data not found."}</div>;
  }

  const { category } = data;

  return (
    <div className="category-page">
      <h1>{category.categoryName}</h1>
      <ul>
        {category.businessListings.map((listing) => (
          <li key={listing.id}>
            <h2>{listing.listingTitle}</h2>
            {listing.Instructor && <p>Instructor: {listing.Instructor}</p>}
            <p>Expertise: {listing.expertise}</p>
            {listing.url && (
              <p>
                Website: <a href={listing.url} target="_blank" rel="noopener noreferrer">{listing.url}</a>
              </p>
            )}
            <p>Email: {listing.email}</p>
            {listing.phone && <p>Phone: {listing.phone}</p>}
            {listing.address && <p>Address: {listing.address}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
