"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-1 items-center p-1 rounded-md border border-border/40 bg-background/50 backdrop-blur-sm">
        <Button variant="ghost" size="icon" disabled className="size-8">
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 items-center p-1 rounded-md border border-border bg-background/50 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className="size-8"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-peach" />
        <span className="sr-only">Light mode</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className="size-8"
      >
        <Moon className="h-[1.2rem] w-[1.2rem] text-sky" />
        <span className="sr-only">Dark mode</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("system")}
        className="size-8"
      >
        <Monitor className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">System theme</span>
      </Button>
    </div>
  );
}
