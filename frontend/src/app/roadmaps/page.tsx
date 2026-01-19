"use client";

import React from "react";
import { useRoadmaps, useUserRoadmaps, useSubscribeRoadmap } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Map, Plus, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RoadmapsBrowserPage() {
  const { data: allRoadmaps, isLoading: loadingAll } = useRoadmaps();
  const { data: userRoadmaps, isLoading: loadingUser } = useUserRoadmaps();
  const subscribe = useSubscribeRoadmap();

  const handleSubscribe = async (id: string) => {
    try {
      await subscribe.mutateAsync(id);
      toast.success("Successfully subscribed to roadmap!");
    } catch (error) {
      toast.error("Failed to subscribe.");
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
              <CardContent className="mt-auto pt-6 border-t border-border flex gap-3">
                {subscribed ? (
                  <Link href={`/roadmaps/${roadmap.id}`} className="w-full">
                    <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold group/btn">
                      Continue Path
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe(roadmap.id)}
                    disabled={subscribe.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    {subscribe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="mr-2 w-4 h-4" />}
                    Start Journey
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
