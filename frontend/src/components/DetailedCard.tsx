"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { motion } from "motion/react";
import { type Card as CardType } from "@/lib/api";
import { LANGUAGE_MAP, type SupportedLanguage, cn } from "@/lib/utils";
import { Devicon } from "@/components/devicon";
import { useTheme } from "next-themes";
import { catppuccinLightTheme, catppuccinDarkTheme } from "@/lib/syntax-themes";

interface DetailedCardProps {
  card: CardType;
  index?: number;
}

export function DetailedCard({ card, index = 0 }: DetailedCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all group h-full flex flex-col shadow-lg">
        <CardHeader className="p-4  flex flex-row items-center justify-between">
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
          <div className="flex gap-2">
            {card.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground font-medium italic">
                #{tag}
              </span>
            ))}
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
            <style jsx global>{`
              .no-scrollbar pre {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .no-scrollbar pre::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
          <div className="p-5 border-t border-border flex-1 bg-muted/30">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Deep Explanation</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans font-light">
              {card.explanation}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
