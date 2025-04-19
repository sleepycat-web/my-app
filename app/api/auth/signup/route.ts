import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    console.log("Signup payload:", { name, email }); // debug
    const signupDate = new Date();

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    console.log("Connected to MongoDB, DB name:", db.databaseName); // debug
    const usersCollection = db.collection("Users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      signupDate,
    });
    console.log("InsertOne result:", result.insertedId); // debug

    // Create a JWT token
    if (!process.env.JWT_SECRET) {
      console.warn("⚠️ JWT_SECRET is not set"); // debug
    }
    const token = jwt.sign(
      { userId: result.insertedId, email },
      process.env.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "7d",
      }
    );

    // Create a response
    const response = NextResponse.json(
      {
        success: true,
        user: { id: result.insertedId, name, email, signupDate },
      },
      { status: 201 }
    );

    // Set the token as an HTTP-only cookie
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
