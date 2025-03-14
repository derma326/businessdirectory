import {
  json
} from "@remix-run/node";
import {
  getSession
} from "../session.server";
import db from "../db.server";
import fetch from "node-fetch";
import slugify from "slugify";

function validateAndFormatPhone(phone) {
  if (!phone) {
      return {
          phone: ""
      };
  }
  phone = phone.trim().replace(/[^\d+]/g, "");
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  if (!phoneRegex.test(phone)) {
      return {
          error: "Invalid phone number format. Use E.164 format (+1234567890)."
      };
  }
  if (!phone.startsWith("+")) {
      phone = `+1${phone}`;
  }
  return {
      phone
  };
}
export async function action({
  request,
  session
}) {
  if (request.method === "OPTIONS") {
      return new Response(null, {
          status: 204,
          headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
          },
      });
  }
  if (request.method !== "POST") {
      return new Response(JSON.stringify({
          success: false,
          error: "Method not allowed"
      }), {
          status: 405,
          headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
              "Content-Type": "application/json",
          },
      });
  }
  try {
      const data = await request.json();
      if (!data.design_options || !["1", "2"].includes(data.design_options)) {
          return json({
              success: false,
              error: "Please select a valid certification type."
          }, {
              status: 400
          });
      }
      const requiredFields = ["listing_title", "instructor_name", "expertise", "email"];
      const session = await getSession(request);
      let shopifyCustomerId = data.customerId;
      console.log("Session Data:", shopifyCustomerId);
      if (!shopifyCustomerId) {
          requiredFields.push("first_name", "last_name");
      }
      for (const field of requiredFields) {
          if (!data[field]) {
              return json({
                  success: false,
                  error: `${field.replace("_", " ")} is required.`
              }, {
                  status: 400
              });
          }
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
          return json({
              success: false,
              error: "Invalid email format."
          }, {
              status: 400
          });
      }
      let phoneValidation = validateAndFormatPhone(data.phone);
      if (phoneValidation?.error) {
          return json({
              success: false,
              error: phoneValidation.error
          }, {
              status: 400
          });
      }
      if (!shopifyCustomerId) {
          const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
          console.log(shopifyAccessToken);
          const shopifyCustomerResponse = await fetch("https://vwygcw-t0.myshopify.com/admin/api/2023-01/customers.json", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": shopifyAccessToken,
              },
              body: JSON.stringify({
                  customer: {
                      first_name: data.first_name,
                      last_name: data.last_name,
                      email: data.email,
                      phone: phoneValidation.phone || "",
                      addresses: [{
                          address1: data.address || "",
                          zip: data.zip_code || "",
                      }, ],
                      send_email_invite: true,
                  },
              }),
          });
          const shopifyResponse = await shopifyCustomerResponse.json();
          if (!shopifyCustomerResponse.ok) {
            console.log("Shopify Response Errors:", shopifyResponse.errors);

              let errorMessage = "Failed to create Shopify customer.";
              if (shopifyResponse.errors?.email) {
                  errorMessage = "Email has already been taken";
              } else if (shopifyResponse.errors) {
                errorMessage = Object.entries(shopifyResponse.errors)
                    .map(([key, value]) => Array.isArray(value) ? value.join(", ") : value)
                    .join(" | ");
            }
              console.error("Shopify Error:", errorMessage);
              return json({
                  success: false,
                  error: errorMessage
              }, {
                  status: 400
              });
          }
          shopifyCustomerId = shopifyResponse.customer.id;
      }
      const newListing = await db.businessDirectory.create({
          data: {
              listingTitle: data.listing_title,
              slug: slugify(data.listing_title, {
                  lower: true,
                  strict: true
              }) || `listing-${Date.now()}`,
              Instructor: data.instructor_name || null,
              expertise: data.expertise,
              url: data.website || null,
              link: data.link || null,
              phone: data.phone || null,
              email: data.email,
              tags: data.tags || null,
              address: data.address || null,
              zip: data.zip_code || null,
              userId: shopifyCustomerId,
              categoryId: parseInt(data.design_options, 10),
          },
      });
      const responseData = {
          ...newListing,
          userId: newListing.userId.toString(),
          shopifyCustomerId,
      };
      return new Response(JSON.stringify({
          success: true,
          data: responseData
      }), {
          status: 200,
          headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
              "Content-Type": "application/json",
          },
      });
  } catch (error) {
      console.error("Database Error:", error);
      return new Response(JSON.stringify({
          success: false,
          error: error.message
      }), {
          status: 500,
          headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
              "Content-Type": "application/json",
          },
      });
  }
}