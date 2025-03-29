import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
  variant?: "sent" | "received";
  children: React.ReactNode;
  className?: string;
}

export function ChatBubble({
  variant = "received",
  children,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start px-2 py-1.5",
        variant === "sent" ? "justify-end" : "justify-start",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ChatBubbleAvatarProps {
  src?: string;
  fallback: React.ReactNode;
  className?: string;
}

export function ChatBubbleAvatar({
  src,
  fallback,
  className,
}: ChatBubbleAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {src ? <AvatarImage src={src} alt="avatar" /> : null}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

interface ChatBubbleMessageProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  variant?: "sent" | "received";
  className?: string;
}

export function ChatBubbleMessage({
  children,
  isLoading = false,
  variant = "received",
  className,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg px-4 py-2 text-sm",
        variant === "sent"
          ? "bg-primary text-white font-medium ml-auto max-w-[85%]"
          : "bg-muted border border-border text-foreground dark:bg-gray-800 dark:border-gray-700 max-w-[85%]",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
} 