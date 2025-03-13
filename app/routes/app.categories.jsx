import {
  Box,
  Card,
  Page,
  Text,
  BlockStack,
  InlineGrid,
  TextField,
  useBreakpoints,
  Divider,
  Button,

} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { json, redirect } from "@remix-run/node";

import { useLoaderData, Form } from "@remix-run/react";
import db from "../db.server";

// Loader function to fetch initial settings
export async function loader() {
  // Mock data from the database
  let categories = await db.categories.findFirst();
  console.log('categories =========>',categories);
  return json(categories);
}

// Action function to handle form submission and update settings
export async function action({ request }) {
  const formData = await request.formData();
  const settings = Object.fromEntries(formData);

  try {
    await db.categories.create({
      data: { 
        categoryName: settings.categoryname,
        categorySlug: settings.slug 
      },
    });

  // Redirect to categories list page (update path accordingly)
  return redirect("/app/listcategories");
  } catch (error) {
    console.error("Database Error:", error);
    return json({ success: false, message: "Error adding category." });
  }
}


// SettingsPage component
export default function SettingsPage() {
  const settings = useLoaderData();
  const { smUp } = useBreakpoints();
  const [formState, setFormState] = useState(settings);

  return (
    <Page>
      <TitleBar title="Settings" />
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Cattegories
              </Text>
              <Text as="p" variant="bodyMd">
                Add new category
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <Form method="POST">
              <BlockStack gap="400">
                <TextField
                  label="Category Name"
                  name="categoryname"
                  value={formState?.categoryname}
                  onChange={(value) =>
                    setFormState({ ...formState, categoryname: value })
                  }
                />
                <TextField
                  label="Slug"
                  name="slug"
                  value={formState?.slug}
                  onChange={(value) =>
                    setFormState({ ...formState, slug: value })
                  }
                />
                <Button submit>Save</Button>
              </BlockStack>
            </Form>
          </Card>
        </InlineGrid>
        {smUp ? <Divider /> : null}
      </BlockStack>
    </Page>
  );
}

// Utility component for displaying inline code
function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}