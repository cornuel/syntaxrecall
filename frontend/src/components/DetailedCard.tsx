"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { motion } from "motion/react";
import { type Card as CardType, useDeleteCard } from "@/lib/api";
import { LANGUAGE_MAP, type SupportedLanguage, cn } from "@/lib/utils";
import { Devicon } from "@/components/devicon";
import { useTheme } from "next-themes";
import { catppuccinLightTheme, catppuccinDarkTheme } from "@/lib/syntax-themes";
import { useState } from "react";
import { Edit2, Trash2, MoreVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditCardDialog } from "@/components/EditCardDialog";
import { toast } from "sonner";

interface DetailedCardProps {
  card: CardType;
  index?: number;
  readOnly?: boolean;
}

export function DetailedCard({ card, index = 0, readOnly = false }: DetailedCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteCard();
  const langKey = card.language.toLowerCase() as SupportedLanguage;
  const langConfig = LANGUAGE_MAP[langKey] || {
    name: card.language,
    icon: null,
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  };
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleDelete = async () => {
    toast("Delete this card?", {
      description: "This action cannot be undone.",
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            await deleteMutation.mutateAsync(card.id);
            toast.success("Card deleted.");
          } catch (error) {
            toast.error("Failed to delete card.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all group h-full flex flex-col shadow-lg">
        <CardHeader className="p-4  flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md border", langConfig.bg, langConfig.border)}>
                {langConfig.icon && (
                  <Devicon 
                    icon={langConfig.icon} 
                    size={14} 
                    className={langConfig.color} 
                  />
                )}
              </div>
              <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest", langConfig.color)}>
                {langConfig.name}
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground line-clamp-1">{card.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {card.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-muted-foreground font-medium italic">
                  #{tag}
              </span>
            ))}
          </div>
          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="gap-2 cursor-pointer">
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="p-4 bg-muted/50 relative overflow-hidden group/code">
            <div className="no-scrollbar">
              <SyntaxHighlighter
                language={card.language.toLowerCase()}
                style={isDark ? catppuccinDarkTheme : catppuccinLightTheme}
                customStyle={{
                  margin: 0,
                  padding: "0.5rem",
                  fontSize: "0.75rem",
                  borderRadius: "0.5rem",
                  background: "transparent",
                  overflowX: "hidden",
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'var(--font-mono)',
                  }
                }}
              >
                {card.code_snippet}
              </SyntaxHighlighter>
            </div>
          </div>
          <div className="p-5 border-t border-border flex-1 bg-muted/30">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Deep Explanation</h4>
            <div 
              className="text-sm text-muted-foreground leading-relaxed font-sans font-light prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
              dangerouslySetInnerHTML={{ __html: card.explanation }}
            />
          </div>
        </CardContent>
      </Card>
      <EditCardDialog 
        card={card} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />
    </motion.div>
  );
}
