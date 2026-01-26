"use client";

import { use, useState, useCallback } from "react";
import {
  useDeck,
  useCards,
  useUpdateDeck,
  useLikeDeck,
  type Card as CardType,
  type FilterState,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StudySession } from "@/components/StudySession";
import { Generator } from "@/components/Generator";
import { DetailedCard } from "@/components/DetailedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Loader2,
  Plus,
  Globe,
  Lock,
  Heart,
  GitFork,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { LayoutToggle } from "@/components/LayoutToggle";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";

export default function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const deckId = parseInt(id);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    language: "",
    tags: [],
  });

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: cards, isPending: cardsLoading } = useCards(deckId, filters);
  const [isStudying, setIsStudying] = useState(false);
  const [layout, setLayout] = useState<1 | 2>(2);

  const updateDeck = useUpdateDeck();
  const likeDeck = useLikeDeck();

  const togglePrivacy = async () => {
    if (!deck) return;
    try {
      await updateDeck.mutateAsync({
        id: deckId,
        is_public: !deck.is_public,
      });
      toast.success(`Deck is now ${!deck.is_public ? "public" : "private"}`);
    } catch {
      toast.error("Failed to update privacy.");
    }
  };

  const handleLike = async () => {
    try {
      await likeDeck.mutateAsync(deckId);
      toast.success("Updated your interest!");
    } catch {
      toast.error("Failed to update like.");
    }
  };

  if (deckLoading || (cardsLoading && !cards))
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-mono animate-pulse text-muted-foreground">
          Assembling your knowledge graph...
        </p>
      </div>
    );
    
  if (!deck)
    return (
      <div className="p-8 text-center text-destructive">Deck not found.</div>
    );

  const dueCards =
    cards?.filter((c: CardType) => new Date(c.next_review) <= new Date()) || [];

  if (isStudying) {
    return (
      <div className="container p-4 mx-auto min-h-screen">
        <div className="py-8 mx-auto max-w-4xl">
          <StudySession
            cards={dueCards.length > 0 ? dueCards : cards || []}
            onComplete={() => setIsStudying(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <main className="container flex flex-col items-center p-4 pb-20 mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 justify-between mb-12 w-full md:flex-row md:items-end">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center text-xs font-bold tracking-widest uppercase transition-colors group text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="mr-1 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Library
          </Link>
          <h1 className="flex gap-4 items-center text-5xl font-extrabold tracking-tight text-foreground">
            {deck.title}
            {deck.parent_id && (
              <GitFork
                className="w-8 h-8 text-muted-foreground"
                title="Forked Deck"
              />
            )}
          </h1>
          <div className="flex gap-4 items-center text-sm text-muted-foreground">
            <div className="flex gap-1.5 items-center">
              {deck.is_public ? (
                <>
                  <Globe className="w-4 h-4 text-primary" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span>Private</span>
                </>
              )}
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <p className="italic font-light leading-relaxed">
              {deck.description}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-border bg-card hover:bg-secondary"
            onClick={togglePrivacy}
            disabled={updateDeck.isPending}
          >
            {deck.is_public ? (
              <>
                <Globe className="w-4 h-4 text-primary" />
                Public
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-muted-foreground" />
                Private
              </>
            )}
          </Button>

          {deck.is_public && (
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-border bg-card hover:bg-secondary"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4 text-destructive" />
              {deck.likes_count}
            </Button>
          )}

          <Button
            size="lg"
            className="px-8 h-14 rounded-2xl shadow-xl transition-all active:scale-95 text-primary-foreground bg-primary shadow-primary/20 group hover:bg-primary/90"
            onClick={() => setIsStudying(true)}
            disabled={!cards || cards.length === 0}
          >
            <GraduationCap className="mr-3 w-6 h-6 transition-transform group-hover:rotate-12" />
            <div className="text-left">
              <div className="text-xs leading-none opacity-70">Flash Mode</div>
              <div className="font-bold">{dueCards.length} Due Now</div>
            </div>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 w-full lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          <Generator deckId={deckId} />

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="flex gap-3 items-center text-2xl font-bold tracking-tight text-foreground">
                Knowledge Base
                <span className="py-1 px-2.5 text-xs rounded-full border bg-secondary text-secondary-foreground border-border">
                  {cards?.length || 0} Assets
                </span>
              </h2>
              <div className="flex gap-4 items-center">
                {cardsLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                <LayoutToggle layout={layout} onChange={setLayout} />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
              <AdvancedFilterBar
                onFilterChange={handleFilterChange}
                externalFilters={filters}
                placeholder="Search cards in this deck..."
              />
            </div>

            <div
              className={cn(
                "grid gap-6 transition-opacity duration-300",
                layout === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
                cardsLoading ? "opacity-50 pointer-events-none" : "opacity-100"
              )}
            >
              {cards?.map((card: CardType, idx: number) => (
                <DetailedCard
                  key={card.id}
                  card={card}
                  index={idx}
                  isFullWidth={layout === 1}
                  onTagClick={(tag) => {
                    if (!filters.tags?.includes(tag)) {
                      setFilters({
                        ...filters,
                        tags: [...(filters.tags || []), tag],
                      });
                    }
                  }}
                />
              ))}
              {(!cards || cards.length === 0) && !cardsLoading && (
                <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-border bg-card/20 backdrop-blur-sm">
                  <div className="flex justify-center mb-4">
                    <Plus className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Your deck is a blank slate
                  </h3>
                  <p className="mt-2 text-sm italic text-muted-foreground/60">
                    Use the generator above to fill it with brilliance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card className="sticky top-6 bg-card border-border backdrop-blur-md">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                Intelligence Report
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-background/40">
                  <span className="text-sm text-muted-foreground">
                    Total Cards
                  </span>
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    {cards?.length || 0} Elements
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border bg-primary/5 border-primary/10">
                  <span className="text-sm text-primary">Ready for Review</span>
                  <span className="text-xl font-bold tracking-tight text-primary">
                    {dueCards.length} Nodes
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="mb-4 font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                  Mastery Progression
                </p>
                <div className="overflow-hidden h-2 rounded-full border bg-background border-border">
                  <div
                    className="h-full bg-gradient-to-r transition-all duration-1000 from-primary to-secondary"
                    style={{ width: `${cards?.length ? 15 : 0}%` }}
                  />
                </div>
                <p className="mt-2 italic text-[10px] text-muted-foreground">
                  Keep studying to increase your retention score.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
