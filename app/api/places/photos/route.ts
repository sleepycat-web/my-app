// File: /app/api/places/photos/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const photoReference = searchParams.get("photoReference"); // This is the full resource name

  if (!photoReference) {
    return NextResponse.json(
      { error: "Photo reference is required" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is missing.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Construct the photo URL using the full resource name
    const photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${apiKey}&maxHeightPx=400`; // Adjust maxHeightPx as needed

    const imageResponse = await fetch(photoUrl);

    if (!imageResponse.ok) {
      console.error(
        `Failed to fetch image from Google: ${imageResponse.status} ${imageResponse.statusText}`
      );
      const errorBody = await imageResponse.text();
      console.error("Google API Error Body:", errorBody);
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.statusText}` },
        { status: imageResponse.status }
      );
    }

    // Get content type and buffer
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageResponse.arrayBuffer();

    // Return the image data with appropriate headers
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day

    return new Response(imageBuffer, { status: 200, headers });
  } catch (error) {
    console.error("Error fetching photo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch photo", details: errorMessage },
      { status: 500 }
    );
  }
}
