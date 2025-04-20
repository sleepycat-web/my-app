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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

    if (timelineMatches.length > 0) {
      type = "timeline";
      data.items = timelineMatches.map((match) => ({
        time: match[1].trim(),
        action: match[2].trim(),
      }));
    } else if (taskMatches.length > 0) {
      type = "task";
      data.items = taskMatches.map((match) => ({
        title: match[1].trim(),
        description: match[2]?.trim() || "",
      }));
    }

    return {
      id: Date.now().toString(),
      role: "bot",
      content: response,
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
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Floating button when chat is closed */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window when open */}
      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              Event Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Selected event details summary */}
          <div className="px-4 py-2 bg-gray-50 text-sm space-y-1 border-b">
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
          </div>

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
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {message.type === "timeline" &&
                        message.data?.items?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Suggested Timeline Items:
                            </p>
                            {message.data.items.map(
                              (
                                item: { time: string; action: string },
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
                                      <Badge variant="outline" className="mb-1">
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
