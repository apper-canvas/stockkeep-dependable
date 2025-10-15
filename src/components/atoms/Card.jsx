import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg bg-white shadow-sm border border-gray-200 transition-shadow hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

const CardHeader = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

const CardContent = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };