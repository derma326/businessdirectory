import { json } from "@remix-run/node";

// Loader function to fetch initial settings
export async function loader() {
    // Mock data from the database
    
    return json({
        ok:true,
        message:"Hi this is test message."
    });
  }