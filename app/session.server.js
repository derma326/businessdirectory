import { createCookieSessionStorage } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    secure: process.env.NODE_ENV === "production",
    secrets: ["your-secret-key"], 
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, 
  },
});

// ✅ Check if request is valid
export async function getSession(request) {
  if (!request || !request.headers) {
    throw new Error("Invalid request object passed to getSession");
  }
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitSession(session) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session) {
  return sessionStorage.destroySession(session);
}
