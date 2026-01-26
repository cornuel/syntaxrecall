"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  language: string;
  tags: string[];
}

interface AdvancedFilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  placeholder?: string;
  className?: string;
  externalFilters?: FilterState;
}

export const AdvancedFilterBar = React.memo(({
  onFilterChange,
  placeholder = "Search with fuzzy logic...",
  className,
  externalFilters,
}: AdvancedFilterBarProps) => {
  const [search, setSearch] = useState(externalFilters?.search || "");
  const [language, setLanguage] = useState(externalFilters?.language || "all");
  const [tags, setTags] = useState<string[]>(externalFilters?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Sync with external filters ONLY if they differ from local state
  // Using functional updates and deep comparison for tags
  useEffect(() => {
    if (externalFilters) {
      setSearch(prevSearch => 
        externalFilters.search !== undefined && externalFilters.search !== prevSearch
          ? externalFilters.search
          : prevSearch
      );
      setLanguage(prevLanguage => 
        externalFilters.language !== undefined && (externalFilters.language || "all") !== prevLanguage
          ? (externalFilters.language || "all")
          : prevLanguage
      );
      setTags(prevTags => {
        const externalTags = externalFilters.tags || [];
        return JSON.stringify(externalTags) !== JSON.stringify(prevTags)
          ? externalTags
          : prevTags;
      });
    }
  // We intentionally only sync when externalFilters object itself changes reference
  // and we compare values inside to avoid loops.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFilters]);

  // Debounced effect for filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        search,
        language: language === "all" ? "" : language,
        tags,
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, language, tags, onFilterChange]); // Added search, language, tags to dependencies

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  const clearFilters = () => {
    setSearch("");
    setLanguage("all");
    setTags([]);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex flex-col md:flex-row gap-3">
        {/* Fuzzy Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={placeholder}
            className="pl-10 bg-secondary/30 border-border focus:bg-secondary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Language Selector */}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full md:w-[180px] bg-secondary/30">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="go">Go</SelectItem>
          </SelectContent>
        </Select>

        {(search || language !== "all" || tags.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-destructive h-9"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
          <Filter className="w-3 h-3" />
          <span>Tags:</span>
        </div>
        
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium group"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <form onSubmit={addTag} className="inline-block">
          <input
            type="text"
            placeholder="Add tag..."
            className="bg-transparent border-none outline-none text-xs w-24 focus:w-40 transition-all text-foreground placeholder:text-muted-foreground/50"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
        </form>

        {search && (
            <div className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary/50 font-bold">
                <Zap className="w-3 h-3" />
                Fuzzy Mode Active
            </div>
        )}
      </div>
    </div>
  );
});

AdvancedFilterBar.displayName = "AdvancedFilterBar";
