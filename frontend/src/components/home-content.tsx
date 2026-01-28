"use client";

import React, { useState } from "react";
import { useDecks, useCreateDeck, useDeleteDeck, type DeckCreate, type FilterState } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { GraduationCap, LayoutGrid, Loader2, Flame } from "lucide-react";
import { HolographicText, NeonText } from "@/components/Typography";
import { useSession } from "next-auth/react";
import { DeckCard } from "@/components/decks/DeckCard";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { toast } from "sonner";

import { LandingPage } from "@/components/landing-page";

function AddDeckDialog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createDeckMutation = useCreateDeck();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeck: DeckCreate = { title, description, is_public: false };
    createDeckMutation.mutate(newDeck);
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="tech" size="lg">
          Add New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Deck</DialogTitle>
          <DialogDescription>
            Create a new flashcard deck. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="cyber" size="tech">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function HomeContent() {
  const { status } = useSession();
  const [filters, setFilters] = useState<FilterState>({ search: "", language: "", tags: [] });
  const [deckToDelete, setDeckToDelete] = useState<number | null>(null);

  const handleFilterChange = React.useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const { data: decks, isPending: isLoading, error } = useDecks(filters, {
    enabled: status === "authenticated",
  });
  const deleteDeck = useDeleteDeck();

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;
    try {
      await deleteDeck.mutateAsync(deckToDelete);
      toast.error("Deck Permanently Deleted", {
        description: "Knowledge set and all associated cards have been removed.",
        position: "top-center",
        duration: 3000,
        className: "bg-destructive text-destructive-foreground border-destructive/20",
      });
      setDeckToDelete(null);
    } catch {
      toast.error("Failed to delete deck.");
    }
  };

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  // This part only runs if status is "authenticated"
  if (isLoading && !decks) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="font-mono text-primary flex items-center gap-2">
          <Loader2 className="animate-spin h-4 w-4" />
          Loading your knowledge...
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-8 text-center text-destructive">
        Error: {error.message}
      </div>
    );

  return (
    <main className="container relative p-4 mx-auto max-w-6xl">
      <div className="relative z-10">
        <div className="flex flex-col items-center py-12 space-y-4 text-center">
          <div className="inline-flex items-center py-2 px-4 rounded-full border border-border bg-card backdrop-blur-sm">
            <GraduationCap className="mr-2 w-4 h-4 text-primary" />
            <NeonText
              text="Master your concepts with AI"
              color="cyan"
              className="text-xs font-bold tracking-wider uppercase"
            />
          </div>
          <HolographicText
            text="SyntaxRecall"
            size="xl"
            className="mb-4 tracking-tighter"
          />
          <p className="leading-relaxed md:text-xl max-w-[600px] text-muted-foreground">
            Create powerful flashcards in seconds. Optimized with Spaced
            Repetition for long-term retention.
          </p>
          <div className="pt-6 flex gap-4 items-center">
            <AddDeckDialog />
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
            <AdvancedFilterBar 
                onFilterChange={handleFilterChange} 
                externalFilters={filters}
                placeholder="Search your library..."
            />
        </div>

        <div className={cn(
            "grid grid-cols-1 gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
            isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
        )}>
          {decks?.map((deck) => (
            <DeckCard 
              key={deck.id} 
              deck={deck} 
              href={`/decks/${deck.id}`} 
              isOwner={true}
              onDelete={(id) => setDeckToDelete(id)}
            />
          ))}
          {decks?.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-border bg-card/50 backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex justify-center items-center mb-4 w-16 h-16 rounded-full bg-muted">
                  <LayoutGrid className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  No decks found
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Create your first deck to start learning
                </p>
                <AddDeckDialog />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deck Deletion Confirmation Dialog */}
      <Dialog open={!!deckToDelete} onOpenChange={(open) => !open && setDeckToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] border-destructive/50 bg-background/95 backdrop-blur-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-xl font-black italic uppercase tracking-tighter">
              <Flame className="w-6 h-6 animate-pulse" />
              Burn Knowledge?
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground/80">
              You are about to permanently delete this deck and all its flashcards. This action is <span className="font-bold text-destructive underline">irreversible</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 px-2">
            {decks?.find(d => d.id === deckToDelete)?.cards?.length && (decks.find(d => d.id === deckToDelete)!.cards!.length > 0) ? (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-xs text-destructive/80 font-mono text-center">
                This will permanently eliminate {decks.find(d => d.id === deckToDelete)!.cards!.length} flashcard{decks.find(d => d.id === deckToDelete)!.cards!.length === 1 ? "" : "s"}.
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeckToDelete(null)} className="font-bold">Abort</Button>
            <Button 
              onClick={handleDeleteDeck} 
              disabled={deleteDeck.isPending}
              variant="destructive"
              className="font-black uppercase tracking-widest shadow-lg shadow-destructive/20"
            >
              {deleteDeck.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Destruction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
