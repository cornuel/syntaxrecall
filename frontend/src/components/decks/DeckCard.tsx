"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutGrid, GitFork, Heart, User, Star, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { Deck } from "@/lib/api";

interface DeckCardProps {
  deck: Deck;
  href: string;
  showStats?: boolean;
  showOwner?: boolean;
  isOwner?: boolean;
  onDelete?: (id: number) => void;
}

export function DeckCard({ deck, href, showStats = false, showOwner = false, isOwner = false, onDelete }: DeckCardProps) {
  return (
    <div className="relative group h-full">
      <Link href={href}>
        <Card
          className={cn(
            "h-full cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-sm border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1",
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
              
              <div className="flex items-center gap-3">
                {showStats && (
                  <div className="flex gap-3 mr-2">
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
                {/* Spacer for Actions menu if isOwner */}
                {isOwner && <div className="w-6" />}
              </div>
            </div>

            <CardTitle className="text-xl font-bold tracking-tight uppercase transition-colors duration-300 text-foreground group-hover:text-primary flex items-center gap-2">
              {deck.title}
              {deck.parent_id && (
                <GitFork className="w-4 h-4 text-muted-foreground" />
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

      {/* Floating Actions Menu for Owners */}
      {isOwner && onDelete && (
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-destructive/10 hover:text-destructive">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(deck.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Burn Deck
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
