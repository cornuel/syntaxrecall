"use client";

import { useState } from "react";
import { useDecks, useCreateDeck, DeckCreate } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { Plus, GraduationCap, LayoutGrid, Github, GitFork } from "lucide-react";
import { HolographicText, NeonText } from "@/components/Typography";
import { useSession, signIn } from "next-auth/react";
import { DeckCard } from "@/components/decks/DeckCard";

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
  const { data: session, status } = useSession();
  const { data: decks, isLoading, error } = useDecks();

  if (status === "unauthenticated") {
    return (
      <main className="container relative p-4 mx-auto max-w-6xl">
        <div className="flex flex-col items-center py-24 space-y-8 text-center">
          <HolographicText
            text="Flashcard AI"
            size="xl"
            className="mb-4 tracking-tighter"
          />
          <p className="leading-relaxed md:text-xl max-w-[600px] text-muted-foreground">
            The intelligent knowledge retention tool for developers. Master new
            languages and frameworks with AI-powered spaced repetition.
          </p>
          <Button size="lg" onClick={() => signIn("github")}>
            <Github className="mr-2 h-5 w-5" />
            Get Started with GitHub
          </Button>
        </div>
      </main>
    );
  }

  if (isLoading || status === "loading")
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="font-mono text-primary">
          Loading your knowledge...
        </div>
      </div>
    );

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
            text="Flashcard AI"
            size="xl"
            className="mb-4 tracking-tighter"
          />
          <p className="leading-relaxed md:text-xl max-w-[600px] text-muted-foreground">
            Create powerful flashcards in seconds. Optimized with Spaced
            Repetition for long-term retention.
          </p>
          <div className="pt-6">
            <AddDeckDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
          {decks?.map((deck) => (
            <DeckCard key={deck.id} deck={deck} href={`/decks/${deck.id}`} />
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
    </main>
  );
}
