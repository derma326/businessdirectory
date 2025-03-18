import { json } from "@remix-run/node";
import db from "../db.server";
import axios from "axios";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

const sessionStorage = new PrismaSessionStorage(db);

async function getShopifyAccessToken(shop) {
  const sessionId = `offline_${shop}`;
  const session = await sessionStorage.loadSession(sessionId);

  if (session && session.accessToken) {
    return session.accessToken;
  }

  throw new Error("Access token not found. Please reinstall the app to authenticate.");
}

// 🔹 Function to create an order in Shopify
async function createOrder(shopifyAccessToken, shop) {
  const orderData = {
    order: {
      email: "gtorres13@mac.com",
      phone: "3104038026",
      customer: {
        first_name: "Germana",
        last_name: "Torres",
        email: "gtorres13@mac.com",
        phone: "3104038026",
      },
      billing_address: {
        first_name: "Germana",
        last_name: "Torres",
        address1: "22129 Dardenne St",
        city: "Calabasas",
        province: "CA",
        country: "US",
        zip: "91302",
        phone: "3104038026",
      },
      shipping_address: {
        first_name: "Germana",
        last_name: "Torres",
        address1: "22129 Dardenne St",
        city: "Calabasas",
        province: "CA",
        country: "US",
        zip: "91302",
        phone: "3104038026",
      },
      line_items: [
        {
          variant_id: 40778959913018, // Replace with a valid variant ID
          quantity: 1,
          price: "179",
        },
      ],
      note: "This is a test order.",
      tags: "Test, Static",
      currency: "USD",
      discount_codes: [
        {
          code: "innovate20",
          amount: "20.00",
          type: "fixed_amount",
        },
      ],
      shipping_lines: [
        {
          title: "Standard Shipping",
          price: "9.95",
          code: "STANDARD",
        },
      ],
      financial_status: "pending",
      fulfillment_status: "unfulfilled",
    },
  };

  // 🔹 Call Shopify API to create the order
  const response = await axios.post(
    `https://${shop}/admin/api/2024-01/orders.json`,
    orderData,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyAccessToken,
      },
    }
  );

  return response.data;
}

// 🔹 `loader` function to trigger order creation on GET request
export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ error: "Shop is required." }, { status: 400 });
    }
    console.log(shop);
    const shopifyAccessToken = await getShopifyAccessToken(shop);
console.log(shopifyAccessToken);
    const orderResponse = await createOrder(shopifyAccessToken, shop);
    return json(orderResponse, { status: 201 });
  } catch (error) {
    console.error("Shopify API Error:", error.response?.data || error.message);
    return json({ error: error.response?.data || "Internal Server Error" }, { status: 500 });
  }
}

// 🔹 `action` function to handle POST requests for order creation
export async function action({ request }) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ error: "Shop is required." }, { status: 400 });
    }

    const shopifyAccessToken = await getShopifyAccessToken(shop);

    const body = await request.json(); // Use provided data if available
    const orderResponse = await createOrder(shopifyAccessToken, shop, body);

    return json(orderResponse, { status: 201 });
  } catch (error) {
    console.error("Shopify API Error:", error.response?.data || error.message);
    return json({ error: error.response?.data || "Internal Server Error" }, { status: 500 });
  }
}
