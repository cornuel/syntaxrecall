"use client";

import React, { useState, useCallback } from "react";
import { useMarketplace, useForkDeck, type FilterState } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import {
  Loader2,
  GitFork,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DeckCard } from "@/components/decks/DeckCard";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const [filters, setFilters] = useState<FilterState>({ search: "", language: "", tags: [] });

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const { data: decks, isPending: isLoading } = useMarketplace(filters);
  const forkDeck = useForkDeck();
  const router = useRouter();

  const handleFork = async (deckId: number) => {
    try {
      const newDeck = await forkDeck.mutateAsync(deckId);
      toast.success("Deck forked to your library!");
      router.push(`/decks/${newDeck.id}`);
    } catch {
      toast.error("Failed to fork deck.");
    }
  };

  if (isLoading && !decks) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-[40vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-mono animate-pulse text-muted-foreground">
          Scanning the multiverse...
        </p>
      </div>
    );
  }

  return (
    <main className="container p-4 pb-20 mx-auto max-w-6xl flex flex-col items-center">
      <div className="flex flex-col gap-6 justify-between mb-12 md:flex-row md:items-end w-full">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground flex items-center gap-4">
            Marketplace
            {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
          </h1>
          <p className="max-w-xl text-lg italic font-light text-muted-foreground">
            Discover and fork community-crafted technical knowledge.
          </p>
        </div>
        <div className="w-full max-w-md">
          <AdvancedFilterBar 
            onFilterChange={handleFilterChange} 
            externalFilters={filters}
          />
        </div>
      </div>

      <div className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full transition-opacity duration-300",
        isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
      )}>
        {decks?.map((deck) => (
          <div key={deck.id} className="relative group">
            <DeckCard
              deck={deck}
              href={`/marketplace/${deck.id}`}
              showStats
              showOwner
            />
            <div className="flex absolute right-6 bottom-6 gap-2 opacity-0 transition-opacity pointer-events-none group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 shadow-xl pointer-events-auto bg-background/80 hover:bg-background backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFork(deck.id);
                }}
                disabled={forkDeck.isPending}
              >
                {forkDeck.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <GitFork className="w-4 h-4" />
                )}
                Fork
              </Button>
            </div>
          </div>
        ))}
        {decks?.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-border bg-card/20">
            <p className="italic text-muted-foreground">
              No decks found matching your search.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
