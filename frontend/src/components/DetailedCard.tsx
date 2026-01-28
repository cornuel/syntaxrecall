"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { type Card as CardType, useDeleteCard } from "@/lib/api";
import {
  LANGUAGE_MAP,
  type SupportedLanguage,
  cn,
  getTagStyle,
} from "@/lib/utils";
import { Devicon } from "@/components/devicon";
import { useTheme } from "next-themes";
import {
  Edit2,
  Trash2,
  MoreVertical,
  Loader2,
  Link as LinkIcon,
  Map,
  X,
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
import { CodePreview } from "./editors/CodePreview";
import { RichTextContent } from "./editors/RichTextContent";
import Link from "next/link";

interface DetailedCardProps {
  card: CardType;
  index?: number;
  readOnly?: boolean;
  isFullWidth?: boolean;
  onTagClick?: (tag: string) => void;
}

export function DetailedCard({
  card,
  index = 0,
  readOnly = false,
  isFullWidth = false,
  onTagClick,
}: DetailedCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsZoomed(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isZoomed]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast("Delete this card?", {
      description: "This action cannot be undone.",
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            await deleteMutation.mutateAsync(card.id);
            toast.success("Card deleted.");
          } catch {
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

  const cardUI = (zoom: boolean = false) => (
    <Card
      className={cn(
        "flex overflow-hidden relative flex-col h-full shadow-lg transition-all border-border bg-card group",
        !zoom && "hover:border-primary/40",
        zoom &&
        "h-auto max-h-[90vh] shadow-2xl border-primary/20 ring-1 ring-primary/10",
      )}
    >
      <CardHeader className="flex relative z-10 flex-row justify-between items-start p-5 bg-gradient-to-b to-transparent from-muted/20 shrink-0">
        {/* Background Logo Watermark */}
        <div className="absolute -top-10 -right-10 z-0 transition-opacity duration-500 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08]">
          <Devicon icon={langConfig.icon || "javascript"} size={180} />
        </div>
        <div className="flex-1 pr-8 min-w-0">
          <h3
            className={cn(
              "mb-1.5 font-bold leading-tight transition-colors text-foreground group-hover:text-primary",
              zoom ? "text-2xl" : "text-base line-clamp-1",
            )}
          >
            {card.title}
          </h3>
          <div className="flex flex-wrap gap-3 items-center mt-1.5">
            {card.roadmap_id ? (
              <Link
                href={`/roadmaps/${card.roadmap_id}`}
                onClick={(e) => e.stopPropagation()}
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
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    className={cn(
                      "text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-sm transition-all duration-300",
                      style.bg,
                      style.text,
                      style.border,
                      style.glow,
                      onTagClick &&
                      "cursor-pointer hover:scale-110 active:scale-95",
                    )}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex relative z-20 gap-2 items-center">
          {zoom && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
              className="w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditOpen(true);
                  }}
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

      <CardContent
        className={cn(
          "flex relative z-10 flex-col flex-1 p-0",
          zoom && "overflow-y-auto",
        )}
      >
        {zoom ? (
          <CodeEditor
            value={card.code_snippet}
            language={card.language}
            readOnly={true}
            height="auto"
            className="rounded-none border-none shadow-inner border-y border-border/50 shrink-0"
          />
        ) : (
          <CodePreview
            value={card.code_snippet}
            language={card.language}
            height={isFullWidth ? "auto" : "180px"}
            className="rounded-none border-none shadow-inner border-y border-border/50 shrink-0"
          />
        )}
        <div className="flex-1 p-5 transition-colors bg-muted/10 group-hover:bg-muted/20">
          <RichTextContent
            content={card.explanation}
            className={cn(
              "opacity-70 transition-opacity group-hover:opacity-90 text-[13px]",
              !(zoom || isFullWidth) && "line-clamp-3",
              zoom && "text-base opacity-100",
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <motion.div
        layoutId={`card-container-${card.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          layout: { type: "spring", stiffness: 400, damping: 30 },
          opacity: { duration: 0.05 },
          y: { duration: 0.05, delay: index * 0.02 },
        }}
        className="h-full cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
      >
        {cardUI(false)}
      </motion.div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isZoomed && (
              <div className="flex fixed inset-0 justify-center items-center p-4 sm:p-8 z-[100]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsZoomed(false)}
                />
                <motion.div
                  layoutId={`card-container-${card.id}`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="relative z-10 w-full max-w-3xl max-h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {cardUI(true)}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <EditCardDialog
        card={card}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}
