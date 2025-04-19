import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { email, password, confirmPassword } = await request.json();

  if (!email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Email, password and confirmation are required." },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 }
    );
  }

  const { db } = await connectToDatabase();
  const users = db.collection("Users");
  const user = await users.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { error: "No account found for that email." },
      { status: 404 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  await users.updateOne({ email }, { $set: { password: hashed } });

  return NextResponse.json({ success: true });
}
