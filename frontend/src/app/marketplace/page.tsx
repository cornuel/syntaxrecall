"use client";

import { useState } from "react";
import { useMarketplace, useForkDeck, useLikeDeck } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Heart,
  GitFork,
  User,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DeckCard } from "@/components/decks/DeckCard";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const { data: decks, isLoading } = useMarketplace(search);
  const forkDeck = useForkDeck();
  const likeDeck = useLikeDeck();
  const router = useRouter();

  const handleFork = async (deckId: number) => {
    try {
      const newDeck = await forkDeck.mutateAsync(deckId);
      toast.success("Deck forked to your library!");
      router.push(`/decks/${newDeck.id}`);
    } catch (error) {
      toast.error("Failed to fork deck.");
    }
  };

  const handleLike = async (deckId: number) => {
    try {
      await likeDeck.mutateAsync(deckId);
      toast.success("Updated your interest!");
    } catch (error) {
      toast.error("Failed to update like.");
    }
  };

  return (
    <main className="container p-4 pb-20 mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 justify-between mb-12 md:flex-row md:items-end">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Marketplace
          </h1>
          <p className="max-w-xl text-lg italic font-light text-slate-400">
            Discover and fork community-crafted technical knowledge.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search decks (React, Rust, etc...)"
            className="pl-10 bg-slate-900/50 border-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 justify-center items-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <p className="font-mono animate-pulse text-slate-500">
            Scanning the multiverse...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  className="gap-2 shadow-xl pointer-events-auto bg-slate-800 hover:bg-slate-700"
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
            <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20">
              <p className="italic text-slate-500">
                No decks found matching your search.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
