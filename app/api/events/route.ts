import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUser } from "@/lib/auth";

// GET all events for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("Events");

    // Find all events for this user
    const events = await eventsCollection
      .find({ userId: new ObjectId(user.userId) })
      .sort({ date: 1 })
      .toArray();

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new event
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventData = await request.json();

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const eventsCollection = db.collection("Events");

    // Add user ID to the event data
    const newEvent = {
      ...eventData,
      userId: new ObjectId(user.userId),
      createdAt: new Date(),
    };

    // Insert the new event
    const result = await eventsCollection.insertOne(newEvent);

    return NextResponse.json(
      {
        success: true,
        event: { ...newEvent, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
