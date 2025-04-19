import { NextResponse } from "next/server"

export async function GET() {
  // Create a response
  const response = NextResponse.json({ success: true }, { status: 200 })

  // Clear the auth token cookie
  response.cookies.set({
    name: "auth-token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  return response
}
