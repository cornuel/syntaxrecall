"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "motion/react";
import { type Card as CardType, useDeleteCard } from "@/lib/api";
import {
  LANGUAGE_MAP,
  type SupportedLanguage,
  cn,
  getTagStyle,
} from "@/lib/utils";
import { Devicon } from "@/components/devicon";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  Edit2,
  Trash2,
  MoreVertical,
  Loader2,
  Link as LinkIcon,
  Map,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditCardDialog } from "@/components/EditCardDialog";
import { toast } from "sonner";
import { CodeEditor } from "./editors/CodeEditor";
import { RichTextContent } from "./editors/RichTextContent";
import Link from "next/link";

interface DetailedCardProps {
  card: CardType;
  index?: number;
  readOnly?: boolean;
}

export function DetailedCard({
  card,
  index = 0,
  readOnly = false,
}: DetailedCardProps) {
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
        onClick: () => { },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="flex overflow-hidden relative flex-col h-full shadow-lg transition-all border-border bg-card group hover:border-primary/40">
        {/* Background Logo Watermark */}
        <div className="absolute inset-0 top-0 right-0 z-0 w-12 h-12 transition-opacity duration-500 pointer-events-none opacity-[0.50] group-hover:opacity-[0.50]">
          <Devicon icon={langConfig.icon || "javascript"} size={300} />
        </div>

        <CardHeader className="flex relative z-10 flex-row justify-between items-start p-5 bg-gradient-to-b to-transparent from-muted/20">
          <div className="flex-1 pr-8 min-w-0">
            <h3 className="mb-1.5 text-base font-bold leading-tight transition-colors text-foreground line-clamp-1 group-hover:text-primary">
              {card.title}
            </h3>
            <div className="flex flex-wrap gap-3 items-center mt-1.5">
              {card.roadmap_id ? (
                <Link
                  href={`/roadmaps/${card.roadmap_id}`}
                  className="flex gap-1.5 items-center font-bold hover:underline text-[10px] text-primary group/link"
                >
                  <LinkIcon className="w-3 h-3 transition-transform group-hover/link:rotate-12" />
                  {card.roadmap_title}
                </Link>
              ) : (
                <div className="flex gap-1.5 items-center font-medium text-[10px] text-muted-foreground">
                  <Map className="w-3 h-3" />
                  Manual Entry
                </div>
              )}
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => {
                  const style = getTagStyle(tag);
                  return (
                    <span
                      key={tag}
                      className={cn(
                        "text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-sm transition-all duration-300",
                        style.bg,
                        style.text,
                        style.border,
                        style.glow,
                      )}
                    >
                      {style.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex relative z-20 gap-2 items-center">
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 w-8 h-8 opacity-0 transition-opacity group-hover:opacity-100 bg-muted/20 hover:bg-muted/40"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="shadow-xl bg-popover border-border"
                >
                  <DropdownMenuItem
                    onClick={() => setIsEditOpen(true)}
                    className="gap-2 font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-primary" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 font-medium cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex relative z-10 flex-col flex-1 p-0">
          <CodeEditor
            value={card.code_snippet}
            language={card.language}
            readOnly={true}
            height="180px"
            className="rounded-none border-none shadow-inner border-y border-border/50"
          />
          <div className="flex-1 p-5 transition-colors bg-muted/10 group-hover:bg-muted/20">
            <RichTextContent
              content={card.explanation}
              className="opacity-70 transition-opacity group-hover:opacity-90 line-clamp-3 text-[13px]"
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
