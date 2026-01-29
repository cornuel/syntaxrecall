"use client";

import { useMe, useDecks, useUserRoadmaps, useUnsubscribeRoadmap, useDeleteDeck } from "@/lib/api";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  LogOut, 
  Layers, 
  Copy, 
  Globe, 
  Map, 
  Github,
  ArrowRight,
  MinusCircle,
  Trash2,
  Flame
} from "lucide-react";
import { DeckCard } from "@/components/decks/DeckCard";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
  const { status: sessionStatus } = useSession();
  const { data: profile, isLoading: profileLoading } = useMe();
  const { data: decks, isLoading: decksLoading } = useDecks();
  const { data: roadmaps, isLoading: roadmapsLoading } = useUserRoadmaps();
  const unsubscribe = useUnsubscribeRoadmap();
  const deleteDeck = useDeleteDeck();

  const [roadmapToUnsubscribe, setRoadmapToUnsubscribe] = useState<string | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<number | null>(null);

  const handleUnsubscribe = async () => {
    if (!roadmapToUnsubscribe) return;
    try {
      await unsubscribe.mutateAsync(roadmapToUnsubscribe);
      toast.error("Successfully unsubscribed", {
        description: "Your roadmap progress has been removed from tracking.",
        position: "top-center",
        duration: 3000,
        className: "bg-destructive text-destructive-foreground border-destructive/20",
      });
      setRoadmapToUnsubscribe(null);
    } catch {
      toast.error("Failed to unsubscribe.");
    }
  };

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

  if (sessionStatus === "loading" || profileLoading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-mono animate-pulse text-muted-foreground">
          Accessing encrypted user profile...
        </p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex flex-col gap-6 justify-center items-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground max-w-md">
          Please log in to view your profile and technical mastery stats.
        </p>
        <Button onClick={() => window.location.href = "/login"}>
          Return to Login
        </Button>
      </div>
    );
  }

  const userDecks = decks || [];

  return (
    <main className="container p-4 pb-20 mx-auto max-w-6xl">
      {/* Header / Hero Section */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-2xl">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "User"} />
            <AvatarFallback className="text-2xl bg-secondary">
              {profile?.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              {profile?.username}
              {profile?.github_id && (
                <Github className="h-5 w-5 text-muted-foreground" />
              )}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              {profile?.email}
            </p>
            <div className="flex gap-2 mt-2">
              <div className="px-2 py-0.5 rounded border border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Technical Librarian
              </div>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatsCard 
          title="Total Decks" 
          value={profile?.total_decks || 0} 
          icon={<Layers className="h-4 w-4 text-cyan-500" />} 
          description="Personal collections"
        />
        <StatsCard 
          title="Total Cards" 
          value={profile?.total_cards || 0} 
          icon={<Copy className="h-4 w-4 text-purple-500" />} 
          description="Knowledge snippets"
        />
        <StatsCard 
          title="Public Decks" 
          value={profile?.public_decks || 0} 
          icon={<Globe className="h-4 w-4 text-green-500" />} 
          description="Community contributions"
        />
        <StatsCard 
          title="Roadmaps" 
          value={profile?.roadmap_subscriptions_count || 0} 
          icon={<Map className="h-4 w-4 text-orange-500" />} 
          description="Learning paths"
        />
      </div>

      {/* Content Tabs / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Active Roadmaps Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Map className="h-6 w-6 text-orange-500" />
              Active Roadmaps
            </h2>
            {roadmapsLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : roadmaps && roadmaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roadmaps.map(roadmap => (
                  <Card key={roadmap.id} className="bg-card border-border hover:border-primary/50 transition-all group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{roadmap.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <Link href={`/roadmaps/${roadmap.id}`} className="flex-1">
                          <Button size="sm" className="w-full gap-2">
                            Continue
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setRoadmapToUnsubscribe(roadmap.id)}
                          disabled={unsubscribe.isPending}
                        >
                          {unsubscribe.isPending && roadmapToUnsubscribe === roadmap.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MinusCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-secondary/10">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Map className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground italic">
                    You aren&apos;t following any roadmaps yet.
                  </p>
                  <Button variant="link" className="mt-2" onClick={() => window.location.href = "/roadmaps"}>
                    Browse Roadmaps
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Personal Collections Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Layers className="h-6 w-6 text-cyan-500" />
              Personal Collections
            </h2>
            {decksLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userDecks.map(deck => (
                  <DeckCard 
                    key={deck.id} 
                    deck={deck} 
                    href={`/decks/${deck.id}`} 
                    isOwner={true}
                    onDelete={(id) => setDeckToDelete(id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-secondary/10">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground italic">
                    Your technical library is empty.
                  </p>
                  <Button variant="link" className="mt-2" onClick={() => window.location.href = "/"}>
                    Create your first deck
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Mastery Matrix</CardTitle>
              <CardDescription>COMING SOON</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                <p className="text-xs text-muted-foreground font-mono text-center px-4">
                  Visualizing your knowledge heatmap across languages...
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AchievementItem 
                label="Early Adopter" 
                unlocked={true} 
                description="Joined SyntaxRecall MVP" 
              />
              <AchievementItem 
                label="Knowledge Creator" 
                unlocked={(profile?.total_decks || 0) > 0} 
                description="Create your first deck" 
              />
              <AchievementItem 
                label="Technical Author" 
                unlocked={(profile?.public_decks || 0) > 0} 
                description="Publish a deck to marketplace" 
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Roadmap Unsubscribe Confirmation Dialog */}
      <Dialog open={!!roadmapToUnsubscribe} onOpenChange={(open) => !open && setRoadmapToUnsubscribe(null)}>
        <DialogContent className="sm:max-w-[425px] border-destructive/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Terminate Journey?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this roadmap? Your mastery progress for this path will be reset, although your flashcards will remain in your library.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRoadmapToUnsubscribe(null)}>Cancel</Button>
            <Button 
              onClick={handleUnsubscribe} 
              disabled={unsubscribe.isPending}
              variant="destructive"
              className="font-bold px-8"
            >
              {unsubscribe.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deck Deletion Confirmation Dialog */}
      <Dialog open={!!deckToDelete} onOpenChange={(open) => !open && setDeckToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] border-destructive/50 bg-background/95 backdrop-blur-xl">
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

function StatsCard({ title, value, icon, description }: { title: string, value: number, icon: React.ReactNode, description: string }) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function AchievementItem({ label, unlocked, description }: { label: string, unlocked: boolean, description: string }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${unlocked ? 'bg-primary/5 border-primary/20' : 'bg-secondary/5 border-transparent grayscale'}`}>
      <div className={`mt-1 h-3 w-3 rounded-full ${unlocked ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
      <div>
        <p className={`text-sm font-bold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{description}</p>
      </div>
    </div>
  );
}
