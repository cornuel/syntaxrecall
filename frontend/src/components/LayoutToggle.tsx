"use client";

import { LayoutGrid, Rows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutToggleProps {
  layout: 1 | 2;
  onChange: (layout: 1 | 2) => void;
  className?: string;
}

export function LayoutToggle({ layout, onChange, className }: LayoutToggleProps) {
  return (
    <div className={cn("flex bg-muted p-1 rounded-lg border border-border shadow-inner", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(1)}
        className={cn(
          "h-8 w-8 p-0 rounded-md transition-all",
          layout === 1 ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Rows className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(2)}
        className={cn(
          "h-8 w-8 p-0 rounded-md transition-all",
          layout === 2 ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
