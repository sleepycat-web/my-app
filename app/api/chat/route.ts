import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      question,
      context,
      eventType,
      guestCount,
      timeRange,
      budget,
      venue,
      address,
    } = await req.json();

    const prompt = `
You are an event planning assistant. Your task is to recommend timelines and tasks for events.

EVENT DETAILS:
${eventType ? `Event Type: ${eventType}` : ""}
${guestCount ? `Number of Guests: ${guestCount}` : ""}
${timeRange ? `Time Range: ${timeRange}` : ""}
${budget ? `Budget: ${budget}` : ""}
${venue ? `Venue: ${venue}` : ""}
${address ? `Address: ${address}` : ""}
${context ? `Additional Context: ${context}` : ""}

USER QUERY: ${question}

Please provide helpful recommendations for this event. If the user is asking about timeline suggestions, format your response with clear time slots like "6:00 PM - Welcome guests". If the user is asking about tasks, format your response with "Task: [task name]" followed by "Description: [description]" on the next line.
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        { error: "Failed to call Gemini API" },
        { status: 500 }
      );
    }

    const apiJson = await apiRes.json();
    const reply = apiJson.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({
      choices: [{ message: { content: reply } }],
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
