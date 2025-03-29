import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter without Shift
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
          form.dispatchEvent(submitEvent);
        }
      }
    };
    
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      
      // Reset height to auto to calculate the new height
      target.style.height = "auto";
      
      // Set new height based on scrollHeight
      target.style.height = `${target.scrollHeight}px`;
    };

    return (
      <textarea
        ref={ref}
        rows={1}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className={cn(
          "flex w-full resize-none border-0 bg-transparent p-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

ChatInput.displayName = "ChatInput"; 