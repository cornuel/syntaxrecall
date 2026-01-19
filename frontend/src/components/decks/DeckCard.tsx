"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LayoutGrid, GitFork, Heart, User, Star } from "lucide-react";
import Link from "next/link";
import { Deck } from "@/lib/api";

interface DeckCardProps {
  deck: Deck;
  href: string;
  showStats?: boolean;
  showOwner?: boolean;
}

export function DeckCard({ deck, href, showStats = false, showOwner = false }: DeckCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "group h-full cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-sm border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 from-primary/5" />
        
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            {showOwner ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{deck.owner_username || "Anonymous"}</span>
              </div>
            ) : <div />}
            
            {showStats && (
              <div className="flex gap-3">
                {deck.rating_count > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-yellow-500/90">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    {deck.rating_avg.toFixed(1)}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" />
                  {deck.likes_count}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GitFork className="w-3 h-3" />
                  {deck.forks_count}
                </div>
              </div>
            )}
          </div>

          <CardTitle className="text-xl font-bold tracking-tight uppercase transition-colors duration-300 text-foreground group-hover:text-primary flex items-center gap-2">
            {deck.title}
            {deck.parent_id && (
              <GitFork className="w-4 h-4 text-muted-foreground" title="Forked Deck" />
            )}
          </CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px] text-muted-foreground">
            {deck.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center text-xs font-medium">
            <span className="flex items-center text-foreground">
              <LayoutGrid className="mr-1.5 w-3 h-3 text-primary" />
              {deck.cards?.length || 0} Cards
            </span>
          </div>
        </CardContent>
        <div className="absolute bottom-0 w-0 h-1 bg-gradient-to-r transition-all duration-700 group-hover:w-full from-primary to-secondary" />
      </Card>
    </Link>
  );
}
