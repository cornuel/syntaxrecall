"use client";

import { use, useState } from "react";
import { useDeck, useCards, useForkDeck, type Card as CardType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DetailedCard } from "@/components/DetailedCard";
import { ChevronLeft, GitFork, Loader2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MarketplaceDeckPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const deckId = parseInt(id);
  const router = useRouter();

  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: cards, isLoading: cardsLoading } = useCards(deckId);
  const forkDeck = useForkDeck();

  const handleFork = async () => {
    try {
      const newDeck = await forkDeck.mutateAsync(deckId);
      toast.success("Deck forked to your library!");
      router.push(`/decks/${newDeck.id}`);
    } catch (error) {
      toast.error("Failed to fork deck.");
    }
  };

  if (deckLoading || cardsLoading)
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="font-mono animate-pulse text-slate-500">
          Previewing brilliance...
        </p>
      </div>
    );

  if (!deck || !deck.is_public)
    return <div className="p-8 text-center text-rose-500">Deck not found or private.</div>;

  return (
    <main className="container p-4 pb-20 mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 justify-between mb-12 md:flex-row md:items-end">
        <div className="space-y-2">
          <Link
            href="/marketplace"
            className="flex items-center text-xs font-bold tracking-widest uppercase transition-colors hover:text-cyan-500 group text-muted-foreground"
          >
            <ChevronLeft className="mr-1 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Marketplace
          </Link>
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500">
            <User className="w-4 h-4" />
            <span>Created by {deck.owner_username}</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-mauve to-foreground flex items-center gap-4">
            {deck.title}
            {deck.parent_id && (
              <GitFork className="w-8 h-8 text-slate-500" title="Forked Deck" />
            )}
          </h1>
          <p className="max-w-xl text-lg italic font-light leading-relaxed text-slate-400">
            {deck.description}
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            size="lg"
            className="px-8 h-14 text-white bg-blue-600 rounded-2xl shadow-xl transition-all hover:bg-blue-500 active:scale-95 shadow-blue-900/20 group"
            onClick={handleFork}
            disabled={forkDeck.isPending}
          >
            {forkDeck.isPending ? <Loader2 className="mr-3 w-6 h-6 animate-spin" /> : <GitFork className="mr-3 w-6 h-6 transition-transform group-hover:rotate-12" />}
            <div className="text-left">
              <div className="text-xs leading-none opacity-70">Fork This Deck</div>
              <div className="font-bold">Add to Library</div>
            </div>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="flex gap-3 items-center text-2xl font-bold tracking-tight text-white">
          Preview Cards
          <span className="py-1 px-2.5 text-xs rounded-full border bg-slate-800 text-slate-400 border-slate-700">
            {cards?.length || 0} Assets
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards?.map((card: CardType, idx: number) => (
            <DetailedCard key={card.id} card={card} index={idx} />
          ))}
        </div>
      </div>
    </main>
  );
}
