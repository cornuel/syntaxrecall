"use client";

import { use, useState } from "react";
import { useDeck, useCards, useForkDeck, useReviews, type Card as CardType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DetailedCard } from "@/components/DetailedCard";
import { StarRating } from "@/components/decks/StarRating";
import { ChevronLeft, GitFork, Loader2, User, Star, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const { data: reviews, isLoading: reviewsLoading } = useReviews(deckId);
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

  if (deckLoading || cardsLoading || reviewsLoading)
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
          <div className="flex items-center gap-4 text-sm text-slate-400">
             {deck.rating_count > 0 && (
               <div className="flex items-center gap-1.5 font-bold text-yellow-500/90">
                 <Star className="w-4 h-4 fill-yellow-500" />
                 {deck.rating_avg.toFixed(1)}
                 <span className="font-normal text-slate-500">({deck.rating_count} reviews)</span>
               </div>
             )}
             <div className="w-1 h-1 bg-slate-700 rounded-full" />
             <p className="italic font-light leading-relaxed">
               {deck.description}
             </p>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <h2 className="flex gap-3 items-center text-2xl font-bold tracking-tight text-white">
              Preview Cards
              <span className="py-1 px-2.5 text-xs rounded-full border bg-slate-800 text-slate-400 border-slate-700">
                {cards?.length || 0} Assets
              </span>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {cards?.map((card: CardType, idx: number) => (
                <DetailedCard key={card.id} card={card} index={idx} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="sticky top-24 space-y-8">
            <StarRating deckId={deckId} />

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Community Feedback
              </h3>
              <div className="space-y-4">
                {reviews?.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-cyan-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                          {review.username}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-3 h-3",
                              s <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-slate-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-400 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {reviews?.length === 0 && (
                  <p className="text-sm italic text-slate-500 text-center py-4">
                    No reviews yet. Be the first!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
