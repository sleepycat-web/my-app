"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Clock,
  CheckSquare,
  Loader2,
  X,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// helper to replace **text** with HTML bold
const formatBold = (text: string) =>
  text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

interface ChatbotProps {
  placeData?: any; // Google Maps API place data
  eventType?: string;
  guestCount?: string;
  startTime?: string;
  endTime?: string;
  budget?: string;
  currency?: string;
  onAddTimeline?: (item: { time: string; action: string }) => void;
  onAddTask?: (item: { title: string; description: string }) => void;
  className?: string;
  badgeCount?: number;
  suggestionPending?: boolean;
  onOpen?: () => void;
  suggestionTrigger?: number;
  onCompleteSuggestion?: () => void;
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  data?: {
    timelineItems?: { time: string; action: string }[];
    taskItems?: { title: string; description: string }[];
  };
}

export default function Chatbot({
  placeData,
  eventType = "",
  guestCount = "",
  startTime = "",
  endTime = "",
  budget = "",
  currency = "USD",
  onAddTimeline,
  onAddTask,
  className,
  badgeCount = 0,
  suggestionPending = false,
  onOpen,
  suggestionTrigger,
  onCompleteSuggestion,
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content:
        "Hi there! I can help recommend timelines and tasks for your event. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // regexes for suggestion parsing
  const timelineRegex =
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(.+?)(?=\n\d{1,2}:\d{2}\s*(?:AM|PM)|$)/gi; // Adjusted to better handle multiline
  const taskRegex =
    /Task:\s*(.+?)(?:\r?\n|\r|^)Description:\s*(.+?)(?:\r?\n|\r|$)/gi; // Adjusted for line breaks

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Generate a context string from the props
  const getContextString = () => {
    let context = "";

    if (eventType) context += `Event Type: ${eventType}. `;
    if (guestCount) context += `Guest Count: ${guestCount}. `;
    if (startTime && endTime) context += `Time: ${startTime} to ${endTime}. `;
    if (budget) context += `Budget: ${currency} ${budget}. `;

    if (placeData) {
      if (placeData.displayName?.text)
        context += `Venue: ${placeData.displayName.text}. `;
      if (placeData.formattedAddress)
        context += `Address: ${placeData.formattedAddress}. `;
      if (placeData.rating) context += `Rating: ${placeData.rating}. `;
    }

    return context;
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare the context and query
      const context = getContextString();
      const query = input;

      // Make API call to your chat endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query,
          context: context,
          history: [...messages, userMessage],
          eventType: eventType,
          guestCount: guestCount,
          timeRange: startTime && endTime ? `${startTime} to ${endTime}` : "",
          budget: budget ? `${currency} ${budget}` : "",
          venue: placeData?.displayName?.text || "",
          address: placeData?.formattedAddress || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot");
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;

      // Process the response to extract BOTH timeline and task suggestions
      const processedMessage = processResponse(botResponse); // Use updated function

      setMessages((prev) => [...prev, processedMessage]);
    } catch (error) {
      console.error("Error in chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated processResponse to find both types
  const processResponse = (response: string): Message => {
    const timelineMatches = [...response.matchAll(timelineRegex)];
    const taskMatches = [...response.matchAll(taskRegex)];

    const data: Message["data"] = {}; // Initialize data object

    if (timelineMatches.length > 0) {
      data.timelineItems = timelineMatches.map((match) => ({
        time: match[1].trim(),
        action: match[2].trim(),
      }));
    }

    if (taskMatches.length > 0) {
      data.taskItems = taskMatches.map((match) => ({
        title: match[1].trim(),
        description: match[2]?.trim() || "",
      }));
    }

    // Create the message object
    const message: Message = {
      id: Date.now().toString(),
      role: "bot",
      content: response, // Keep original response for context or clean it up later if needed
      data: data.timelineItems || data.taskItems ? data : undefined, // Only add data if items were found
    };

    return message;
  };

  const handleAddToTimeline = (item: { time: string; action: string }) => {
    if (onAddTimeline) {
      onAddTimeline(item);
    }
  };

  const handleAddToTasks = (item: { title: string; description: string }) => {
    if (onAddTask) {
      onAddTask(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleChat = () => {
    if (!isOpen && onOpen) onOpen(); // notify parent on first open
    setIsOpen(!isOpen);
  };

  // clear chat back to empty
  const clearChat = () => {
    setMessages([]);
  };

  // auto‑trigger AI suggestions when parent clicks "Get AI Suggestions"
  useEffect(() => {
    // only fetch suggestions when trigger > 0 (i.e. after "Get AI Suggestions" click)
    if (!suggestionTrigger) return;
    const fetchSuggestion = async () => {
      setIsLoading(true);
      try {
        const context = getContextString();
        const timeInfo =
          startTime && endTime ? ` between ${startTime} and ${endTime}` : "";
        // Updated prompt to explicitly ask for both and mention format adherence
        const suggestionPrompt = `Please provide a suggested timeline with relevant, detailed actions${timeInfo}. Format each item STRICTLY as 'hh:mm AM/PM - Action' on its own line. Then, provide exactly 5 task items formatted STRICTLY as 'Task: [title]' followed by 'Description: [short description, 1-2 sentences max]' on the next line. Ensure clear separation if providing both.`;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: suggestionPrompt, // Use the specific suggestion prompt
            context,
            history: [], // Start fresh for suggestions
            eventType,
            guestCount,
            timeRange: startTime && endTime ? `${startTime} to ${endTime}` : "",
            budget: budget ? `${currency} ${budget}` : "",
            venue: placeData?.displayName?.text || "",
            address: placeData?.formattedAddress || "",
          }),
        });

        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
          throw new Error("Empty response from API");
        }

        // Use the updated processResponse to handle the reply
        const processedSuggestionMessage = processResponse(reply);

        // Add the single message (which might contain both timeline and task data)
        if (
          processedSuggestionMessage.data?.timelineItems ||
          processedSuggestionMessage.data?.taskItems
        ) {
          setMessages((prev) => [...prev, processedSuggestionMessage]);
        } else {
          // Fallback if parsing failed but got a reply
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-gen",
              role: "bot",
              content: reply, // Show the raw reply
            },
          ]);
        }

        onCompleteSuggestion?.();
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-err",
            role: "bot",
            content:
              "Sorry, I couldn't generate suggestions right now. Please check the format or try again.",
          },
        ]);
        onCompleteSuggestion?.(); // Ensure this is called even on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestion();
  }, [suggestionTrigger]); // Add dependencies like startTime, endTime if the prompt changes based on them

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Floating button when chat is closed */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="relative h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300"
        >
          {suggestionPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
          {badgeCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 p-1 rounded-full text-xs"
            >
              {badgeCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat window when open */}
      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          {/* Header component with single-line alignment */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-lg font-semibold whitespace-nowrap">
                Event Assistant
              </span>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected event details summary
          <div className="px-4 text-sm space-y-1 ">
            {eventType && (
              <p>
                <strong>Type:</strong> {eventType}
              </p>
            )}
            {guestCount && (
              <p>
                <strong>Guests:</strong> {guestCount}
              </p>
            )}
            {startTime && endTime && (
              <p>
                <strong>Time:</strong> {startTime} to {endTime}
              </p>
            )}
            {budget && (
              <p>
                <strong>Budget:</strong> {currency} {budget}
              </p>
            )}
            {budget && (
              <p>
                <strong>Budget:</strong> {currency} {budget}
              </p>
            )}
            {placeData?.displayName?.text && (
              <p>
                <strong>Venue:</strong> {placeData.displayName.text}
              </p>
            )}
          </div> */}

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea
              className="flex-1 p-4 overflow-y-auto"
              ref={scrollAreaRef}
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {/* Display raw content first (optional, could be removed if suggestions are always parsed) */}
                      <p
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: formatBold(message.content),
                        }}
                      />

                      {/* Render Timeline Items if they exist */}
                      {message.role === "bot" &&
                        message.data?.timelineItems &&
                        message.data.timelineItems.length > 0 && (
                          <div className="mt-3 space-y-2 border-t pt-2 border-gray-300 dark:border-gray-600">
                            <p className="text-xs font-semibold flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Suggested Timeline Items:
                            </p>
                            {message.data.timelineItems.map(
                              (
                                item: { time: string; action: string },
                                index: number
                              ) => (
                                <div
                                  key={`${message.id}-tl-${index}`}
                                  className={`rounded p-2 text-xs bg-white dark:bg-gray-700 shadow-sm`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <Badge variant="outline" className="mb-1">
                                        {item.time}
                                      </Badge>
                                      <p>{item.action}</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-6 px-2 text-xs ml-2 flex-shrink-0" // Added margin and shrink
                                      onClick={() => handleAddToTimeline(item)}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                      {/* Render Task Items if they exist */}
                      {message.role === "bot" &&
                        message.data?.taskItems &&
                        message.data.taskItems.length > 0 && (
                          <div className="mt-3 space-y-2 border-t pt-2 border-gray-300 dark:border-gray-600">
                            <p className="text-xs font-semibold flex items-center">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              Suggested Tasks:
                            </p>
                            {message.data.taskItems.map(
                              (
                                item: { title: string; description: string },
                                index: number
                              ) => (
                                <div
                                  key={`${message.id}-ts-${index}`} // Unique key for tasks
                                  className={`rounded p-2 text-xs bg-white dark:bg-gray-700 shadow-sm`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">
                                        {item.title}
                                      </p>
                                      {item.description && (
                                        <p className="text-xs opacity-80">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-6 px-2 text-xs ml-2 flex-shrink-0" // Added margin and shrink
                                      onClick={() => handleAddToTasks(item)}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about timelines or tasks..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
