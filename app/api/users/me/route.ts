import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return null;
  }
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = payload.userId;
    const { db } = await connectToDatabase();
    const user = await db
      .collection("Users")
      .findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (e) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const update: any = { $set: {} };
  if (data.name !== undefined) update.$set.name = data.name;
  if (data.bio !== undefined) update.$set.bio = data.bio;
  if (data.preferences !== undefined)
    update.$set.preferences = data.preferences;
  if (data.notifications !== undefined)
    update.$set.notifications = data.notifications;
  const { db } = await connectToDatabase();
  await db.collection("Users").updateOne({ _id: user._id }, update);
  const updatedUser = await db.collection("Users").findOne({ _id: user._id });
  return NextResponse.json({ user: updatedUser });
}
