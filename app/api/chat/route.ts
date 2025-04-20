import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      question,
      context,
      history = [],
      eventType,
      guestCount,
      timeRange,
      budget,
      venue,
      address,
    } = await req.json();

    // Format history lines
    const formattedHistory = history
      .map((m: any) =>
        m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`
      )
      .join("\n");

    const prompt = `
${
  formattedHistory ? `HISTORY:\n${formattedHistory}\n\n` : ""
}You are an event planning assistant. Your task is to recommend timelines and tasks for events based on the provided details.

EVENT DETAILS:
${eventType ? `Event Type: ${eventType}` : "Not specified"}
${guestCount ? `Number of Guests: ${guestCount}` : "Not specified"}
${timeRange ? `Time Range: ${timeRange}` : "Not specified"}
${budget ? `Budget: ${budget}` : "Not specified"}
${venue ? `Venue: ${venue}` : "Not specified"}
${address ? `Address: ${address}` : "Not specified"}
${context ? `Additional Context: ${context}` : ""}

USER QUERY: ${question}

INSTRUCTIONS:
- Analyze the user query and event details.
- If the query asks for a timeline or includes "timeline items":
    - If a 'Time Range' (e.g., 6:00 PM to 10:00 PM) is provided in the EVENT DETAILS, generate relevant timeline suggestions covering that entire duration.
    - If no 'Time Range' is provided, generate a reasonable set of timeline suggestions based on the event type.
    - Format each item strictly as 'hh:mm AM/PM - Detailed Action' (e.g., '6:00 PM - Guests arrive, welcome drinks served, light background music'). Ensure actions are descriptive.
- If the query asks for tasks or includes "task items", provide relevant task suggestions. Format each item strictly as 'Task: [Task Title]' followed by 'Description: [Short, concise description, 1-2 sentences max]' on the next line. Ensure descriptions are brief.
- If the query asks for both (like the specific suggestion request: "Please provide a suggested timeline... and 5 task items..."), generate both types of suggestions according to their respective formats, ensuring the timeline covers the specified duration if provided.
- If the query is general, provide a helpful, conversational response related to event planning.
- Adhere strictly to the requested formats when generating timelines or tasks.
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
