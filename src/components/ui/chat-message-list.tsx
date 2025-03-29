import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageListProps {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
}

export function ChatMessageList({
  children,
  className,
  autoScroll = true,
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [children, autoScroll]);

  return (
    <div className={cn("flex flex-col overflow-y-auto p-4", className)}>
      {children}
      <div ref={messagesEndRef} />
    </div>
  );
} 