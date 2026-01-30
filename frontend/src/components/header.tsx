"use client";

import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Terminal, BrainCircuit } from "lucide-react";
import { AISettingsDialog } from "./AISettingsDialog";

export function Header() {
  const { data: session } = useSession();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  const openSwagger = () => {
    if (session && session.backendToken) {
      const token = session.backendToken;
      window.open(`${BACKEND_URL}/auth/swagger-login?token=${token}`, "_blank");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-6xl items-center px-4 mx-auto">
        <div className="flex items-center gap-8 w-full">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="font-bold text-lg tracking-tight text-foreground italic uppercase">
              SyntaxRecall
            </span>
          </Link>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center gap-6">
              {session ? (
                <>
                  <Link
                    href="/"
                    className="text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground"
                  >
                    Home
                  </Link>
                  <Link
                    href="/marketplace"
                    className="text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground"
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/roadmaps"
                    className="text-sm font-medium transition-colors hover:text-foreground/80 text-muted-foreground"
                  >
                    Roadmaps
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.user?.image || ""}
                            alt={session.user?.name || ""}
                          />
                          <AvatarFallback>
                            {session.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user?.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <AISettingsDialog 
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            <span>AI Settings</span>
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuItem onClick={openSwagger} className="cursor-pointer">
                        <Terminal className="mr-2 h-4 w-4" />
                        <span>Developer API</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => signOut()}
                      >
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-xs">
                  <Link href="/login">Login</Link>
                </Button>
              )}
              <ThemeSwitcher />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
