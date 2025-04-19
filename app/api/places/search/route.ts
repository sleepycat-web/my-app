import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is missing");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      textQuery,
      fields = "*",
      locationBias,
      includedType,
      language = "en-US",
      maxResultCount = 20,
    } = body;

    if (!textQuery) {
      return NextResponse.json(
        { error: "Missing textQuery parameter" },
        { status: 400 }
      );
    }

    const apiUrl = `https://places.googleapis.com/v1/places:searchText`;

    const requestBody: Record<string, any> = {
      textQuery,
      languageCode: language,
      maxResultCount,
    };

    // Add optional parameters if they exist
    if (locationBias) requestBody.locationBias = locationBias;
    if (includedType) requestBody.includedType = includedType;
    // Add other parameters like isOpenNow, minRating, region, useStrictTypeFiltering if needed

    console.log(
      "Sending request to Google Places API:",
      JSON.stringify(requestBody)
    );

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fields, // Use field mask to specify desired fields
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    console.log("Received response from Google Places API:", data);

    if (!res.ok) {
      console.error("Google Places API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to fetch places" },
        { status: res.status }
      );
    }

    // Ensure places is an array, even if empty or null
    const places = data.places || [];

    return NextResponse.json({ places });
  } catch (error) {
    console.error("Error in places search API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
