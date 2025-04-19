import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

interface DecodedToken {
  userId: string
  email: string
  iat: number
  exp: number
}

export async function getUser(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as DecodedToken

    return {
      userId: decoded.userId,
      email: decoded.email,
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getUser(request)

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}
