"use client";

import { useMe, useDecks } from "@/lib/api";
import { useSession, signOut } from "next-auth/react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
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
  Trophy
} from "lucide-react";
import { DeckCard } from "@/components/decks/DeckCard";

export default function ProfilePage() {
  const { status: sessionStatus } = useSession();
  const { data: profile, isLoading: profileLoading } = useMe();
  const { data: decks, isLoading: decksLoading } = useDecks();

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

  const publicDecks = decks?.filter(d => d.is_public) || [];

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
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Public Contributions
            </h2>
            {decksLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : publicDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publicDecks.map(deck => (
                  <DeckCard key={deck.id} deck={deck} href={`/decks/${deck.id}`} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-secondary/10">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground italic">
                    You haven&apos;t published any decks to the marketplace yet.
                  </p>
                  <Button variant="link" className="mt-2" onClick={() => window.location.href = "/"}>
                    Go to your library
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
