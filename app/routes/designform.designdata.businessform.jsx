import {
  json
} from "@remix-run/node";
import {
  getSession
} from "../session.server";
import db from "../db.server";
import fetch from "node-fetch";
import slugify from "slugify";

import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import nodemailer from "nodemailer";



const sessionStorage = new PrismaSessionStorage(db);
// Configure the mail transport
const transporter = nodemailer.createTransport({
    service: "gmail", // Change this based on your mail provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app password
    }
});


// Function to send email
async function sendListingConfirmation(email, listingTitle) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        replyTo: "lumhosderma@gmail.com", // Set your custom reply-to email
        subject: "Your Business Listing Submission",
        text: `Dear User,\n\nYour listing "${listingTitle}" has been successfully submitted. It will be reviewed and approved within 24 hours.\n\nThank you!`,
        html: `<p>Dear User,</p><p>Your listing <strong>${listingTitle}</strong> has been successfully submitted.</p><p>It will be reviewed and approved within <strong>24 hours</strong>.</p><p>Thank you!</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent successfully.");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}


async function getShopifyAccessToken(shop) {
    const sessionId = `offline_${shop}`; // Ensure correct session format

    const session = await sessionStorage.loadSession(sessionId);
   // console.log("Session Data:", session); // Debugging log

    if (session && session.accessToken) {
        return session.accessToken;
    }

    throw new Error("Access token not found. Reinstall the app to authenticate.");
}



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
        const url = new URL(request.url);
        const shop = url.searchParams.get("shop"); // Extract shop from query params
    
      
        if (!shop) {
            throw new Error("Shop is undefined. Ensure the store URL is stored in the session.");
        }
       // console.log(shop);
        const shopifyAccessToken = await getShopifyAccessToken(`${shop}`);

          console.log("Access token",shopifyAccessToken);
          console.log("Shopify API URL:", `https://${shop}/admin/api/2023-01/customers.json`);

          const shopifyCustomerResponse = await fetch(`https://${shop}/admin/api/2023-01/customers.json`, {
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
             // console.error("Shopify Error:", errorMessage);
              return json({
                  success: false,
                  error: errorMessage
              }, {
                  status: 400
              });
          }
          shopifyCustomerId = shopifyResponse.customer.id;
      }
      console.log("Creating business directory listing:", data);

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

      // Inside your action function after creating the listing
        await sendListingConfirmation(data.email, data.listing_title);

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