"use client";

import React, { useState } from "react";
import { useRoadmaps, useUserRoadmaps, useSubscribeRoadmap, useUnsubscribeRoadmap } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Map, Plus, ArrowRight, Sparkles, Loader2, BookOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";

export default function RoadmapsBrowserPage() {
  const { data: allRoadmaps, isLoading: loadingAll } = useRoadmaps();
  const { data: userRoadmaps, isLoading: loadingUser } = useUserRoadmaps();
  const subscribe = useSubscribeRoadmap();
  const unsubscribe = useUnsubscribeRoadmap();

  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);
  const [includeDefaultCards, setIncludeDefaultCards] = useState(true);

  const [roadmapToUnsubscribe, setRoadmapToUnsubscribe] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!selectedRoadmap) return;
    try {
      await subscribe.mutateAsync({ 
        id: selectedRoadmap, 
        includeDefaultCards 
      });
      toast.success("Successfully subscribed to roadmap!");
      setSelectedRoadmap(null);
    } catch {
      toast.error("Failed to subscribe.");
    }
  };

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

  const isSubscribed = (id: string) => {
    return userRoadmaps?.some((r) => r.id === id);
  };

  if (loadingAll || loadingUser) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-mono animate-pulse text-muted-foreground">
          Mapping the future...
        </p>
      </div>
    );
  }

  return (
    <main className="container p-4 pb-20 mx-auto max-w-6xl flex flex-col items-center">
      <div className="space-y-2 mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
          Skill Roadmaps
        </h1>
        <p className="max-w-xl text-lg italic font-light text-muted-foreground">
          Master technologies through structured, interactive knowledge trees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {allRoadmaps?.map((roadmap) => {
          const subscribed = isSubscribed(roadmap.id);
          
          return (
            <Card key={roadmap.id} className="bg-card border-border hover:border-primary/50 transition-all group overflow-hidden flex flex-col">
              <CardHeader className="relative">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Map className="w-20 h-20 rotate-12 text-primary" />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                    v{roadmap.version}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {roadmap.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground line-clamp-2">
                  {roadmap.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6 border-t border-border flex flex-col gap-2">
                {subscribed ? (
                  <>
                    <Link href={`/roadmaps/${roadmap.id}`} className="w-full">
                      <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold group/btn">
                        Continue Path
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setRoadmapToUnsubscribe(roadmap.id)}
                      disabled={unsubscribe.isPending}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-[10px] uppercase tracking-widest font-bold"
                    >
                      {unsubscribe.isPending && roadmapToUnsubscribe === roadmap.id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Trash2 className="w-3 h-3 mr-2" />}
                      Leave Roadmap
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setSelectedRoadmap(roadmap.id)}
                    disabled={subscribe.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    {subscribe.isPending && selectedRoadmap === roadmap.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="mr-2 w-4 h-4" />}
                    Start Journey
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedRoadmap} onOpenChange={(open) => !open && setSelectedRoadmap(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Initialize Journey
            </DialogTitle>
            <DialogDescription>
              You are about to subscribe to this roadmap. Would you like to seed your library with the recommended flashcards?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col gap-4">
            <div 
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                includeDefaultCards ? "border-primary bg-primary/5" : "border-border bg-transparent"
              }`}
              onClick={() => setIncludeDefaultCards(!includeDefaultCards)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${includeDefaultCards ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Starter Cards</div>
                  <div className="text-xs text-muted-foreground">Import recommended decks</div>
                </div>
              </div>
              <Toggle 
                pressed={includeDefaultCards} 
                onPressedChange={setIncludeDefaultCards}
                aria-label="Toggle starter cards"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {includeDefaultCards ? "ON" : "OFF"}
              </Toggle>
            </div>
            
            <p className="text-[10px] text-muted-foreground italic px-1">
              * Recommended for first-time learners. You can always delete them later.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRoadmap(null)}>Cancel</Button>
            <Button 
              onClick={handleSubscribe} 
              disabled={subscribe.isPending}
              className="bg-primary text-primary-foreground font-bold px-8"
            >
              {subscribe.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsubscribe Confirmation Dialog */}
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
    </main>
  );
}
