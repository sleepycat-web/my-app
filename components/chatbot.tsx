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
  type?: "timeline" | "task";
  data?: any;
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
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(.+?)(?=\d{1,2}:\d{2}\s*(?:AM|PM)|$)/gi;
  const taskRegex = /Task:\s*(.+?)(?:\n|$)(?:Description:\s*(.+?)(?:\n|$))?/gi;

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

      // Process the response to extract timeline and task suggestions
      const processedResponse = processResponse(botResponse);

      setMessages((prev) => [...prev, processedResponse]);
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

  // Process the bot response to extract timeline and task suggestions
  const processResponse = (response: string): Message => {
    // Check if response contains timeline suggestions
    const timelineRegex =
      /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(.+?)(?=\d{1,2}:\d{2}\s*(?:AM|PM)|$)/gi;
    const taskRegex =
      /Task:\s*(.+?)(?:\n|$)(?:Description:\s*(.+?)(?:\n|$))?/gi;

    const timelineMatches = [...response.matchAll(timelineRegex)];
    const taskMatches = [...response.matchAll(taskRegex)];

    let type: "timeline" | "task" | undefined;
    const data: any = {};
    let processedContent = response; // Start with the original response

    if (timelineMatches.length > 0) {
      type = "timeline";
      data.items = timelineMatches // Removed .slice(0, 5)
        .map((match) => ({
          time: match[1].trim(),
          action: match[2].trim(),
        }));
      // Optionally remove the matched timeline strings from the main content if needed
      // processedContent = response.replace(timelineRegex, '').trim();
    } else if (taskMatches.length > 0) {
      type = "task";
      data.items = taskMatches
        .slice(0, 5) // Keep limit for tasks for now, or remove if desired
        .map((match) => ({
          title: match[1].trim(),
          description: match[2]?.trim() || "",
        }));
      // Optionally remove the matched task strings from the main content
      // processedContent = response.replace(taskRegex, '').trim();
    }

    // If suggestions were found, decide if the main content should still be shown
    // For now, keep the original response as content, suggestions are extra data
    return {
      id: Date.now().toString(),
      role: "bot",
      content: response, // Keep original response for context
      type,
      data,
    };
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
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: `Please provide a suggested timeline with relevant, detailed actions covering the event duration${timeInfo}. Format each item as 'hh:mm AM/PM - Action'. Then, provide exactly 5 task items formatted as 'Task: [title]\\nDescription: [short description, 1-2 sentences max]'.`,
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
        const data = await res.json();
        const reply = data.choices[0].message.content;

        // Use the main processResponse function to handle parsing
        const processed = processResponse(reply);

        // Create separate messages if both types are present in one response
        const newMessages: Message[] = [];

        if (
          processed.type === "timeline" &&
          processed.data?.items?.length > 0
        ) {
          newMessages.push({
            id: Date.now().toString() + "-tl",
            role: "bot",
            type: "timeline",
            // Use a generic message or part of the reply if needed
            content: "Here are some timeline suggestions:",
            data: { items: processed.data.items },
          });
        }

        // Check for tasks separately using regex directly on the reply
        // as processResponse might only pick one type
        const taskMatches = [...reply.matchAll(taskRegex)];
        if (taskMatches.length > 0) {
          newMessages.push({
            id: Date.now().toString() + "-ts",
            role: "bot",
            type: "task",
            // Use a generic message or part of the reply if needed
            content: "Here are some task suggestions:",
            data: {
              items: taskMatches.slice(0, 5).map((m) => ({
                // Keep task limit for now
                title: m[1].trim(),
                description: m[2]?.trim() || "",
              })),
            },
          });
        }

        // Fallback if no specific suggestions parsed but got a reply
        if (newMessages.length === 0 && reply) {
          newMessages.push({
            id: Date.now().toString() + "-gen",
            role: "bot",
            content: reply, // Show the raw reply
          });
        }

        setMessages((prev) => [...prev, ...newMessages]);
        onCompleteSuggestion?.();
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "bot",
            content: "Sorry, I couldn't generate suggestions right now.",
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
                      <p
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: formatBold(message.content),
                        }}
                      />

                      {message.type === "timeline" &&
                        message.data?.items?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Suggested Timeline Items:
                            </p>
                            {/* Ensure message.data.items is an array before mapping */}
                            {Array.isArray(message.data.items) &&
                              message.data.items.map(
                                (
                                  item: { time: string; action: string },
                                  index: number
                                ) => (
                                  <div
                                    key={`${message.id}-tl-${index}`} // More unique key
                                    className={`rounded p-2 text-xs ${
                                      message.role === "user"
                                        ? "bg-purple-700"
                                        : "bg-white dark:bg-gray-700 shadow-sm"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <Badge
                                          variant="outline"
                                          className="mb-1"
                                        >
                                          {item.time}
                                        </Badge>
                                        <p>{item.action}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={
                                          message.role === "user"
                                            ? "secondary"
                                            : "default"
                                        }
                                        className="h-6 px-2 text-xs"
                                        onClick={() =>
                                          handleAddToTimeline(item)
                                        }
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                        )}

                      {message.type === "task" &&
                        message.data?.items?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold flex items-center">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              Suggested Tasks:
                            </p>
                            {message.data.items.map(
                              (
                                item: { title: string; description: string },
                                index: number
                              ) => (
                                <div
                                  key={index}
                                  className={`rounded p-2 text-xs ${
                                    message.role === "user"
                                      ? "bg-purple-700"
                                      : "bg-white dark:bg-gray-700 shadow-sm"
                                  }`}
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
                                      variant={
                                        message.role === "user"
                                          ? "secondary"
                                          : "default"
                                      }
                                      className="h-6 px-2 text-xs"
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
