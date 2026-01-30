"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useGenerateAICard,
  useCreateCard,
  type AIProjectResponse,
} from "@/lib/api";
import { useAISettings, type AIProvider } from "@/hooks/use-ai-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/editors/CodeEditor";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Loader2,
  Sparkles,
  PlusCircle,
  Save,
  Edit2,
  Wand2,
  Tag,
  Globe,
  Settings2,
  Key,
  ChevronDown,
  Cpu,
  Sparkle,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGE_MAP, type SupportedLanguage } from "@/lib/utils";
import { HolographicText, NeonText } from "@/components/Typography";
import { Devicon } from "@/components/devicon";
import { RichTextContent } from "./editors/RichTextContent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";

interface GeneratorProps {
  deckId: number;
}

type Mode = "ai" | "manual";

const PROVIDER_MODELS: Record<AIProvider, { name: string; models: string[] }> =
{
  gemini: {
    name: "Gemini",
    models: [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash-lite",
      "gemini-3-flash-preview",
      "gemini-3-pro-preview",
    ],
  },
  openai: {
    name: "OpenAI",
    models: [
      "gpt-4o-mini",
      "gpt-4o",
      "o1-mini",
      "o1",
      "gpt-5-mini-preview",
      "gpt-5.2-nano-preview",
      "gpt-5.2-pro-preview",
    ],
  },
  anthropic: {
    name: "Claude",
    models: [
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
      "claude-3-opus-latest",
      "claude-4.5-sonnet-preview",
      "claude-4.5-haiku-preview",
      "claude-4.5-opus-preview",
    ],
  },
  groq: {
    name: "Groq",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
    ],
  },
  qwen: {
    name: "Qwen",
    models: ["qwen-plus", "qwen-max", "qwen-turbo"],
  },
};

export function Generator({ deckId }: GeneratorProps) {
  const router = useRouter();
  const { settings, setActiveProvider, setLastUsedModel, isLoaded } =
    useAISettings();

  const [mode, setMode] = useState<Mode>("ai");
  const [prompt, setPrompt] = useState("");
  const [previewCard, setPreviewCard] = useState<AIProjectResponse | null>(
    null,
  );

  const [manualTitle, setManualTitle] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualExplanation, setManualExplanation] = useState("");
  const [manualLanguage, setManualLanguage] = useState<SupportedLanguage>("js");
  const [manualTags, setManualTags] = useState("");

  // Local override for custom model entry
  const [showCustomModelInput, setShowCustomModelInput] = useState(false);
  const [customModelId, setCustomModelId] = useState("");

  const generateMutation = useGenerateAICard();
  const createCardMutation = useCreateCard();

  const activeProvider = settings.activeProvider;
  const activeModel = settings.lastUsedModel[activeProvider];
  const apiKey = settings.keys[activeProvider];

  const configuredProviders = useMemo(() => {
    return (Object.entries(settings.keys) as [AIProvider, string][])
      .filter(([_, key]) => !!key)
      .map(([id]) => id);
  }, [settings.keys]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!apiKey) {
      toast.error("AI Not Configured", {
        description:
          "Please provide an API key in settings to use the generator.",
        action: {
          label: "Settings",
          onClick: () => router.push("/settings/ai"),
        },
      });
      return;
    }

    try {
      const generated = await generateMutation.mutateAsync({
        prompt,
        provider: activeProvider,
        api_key: apiKey,
        model: showCustomModelInput ? customModelId : activeModel,
      });
      setPreviewCard(generated);
      toast("Success", {
        description: `AI generated a card using ${showCustomModelInput ? customModelId : activeModel}.`,
      });
    } catch (error: unknown) {
      let detail = "AI failed to generate content.";
      if (error instanceof AxiosError) {
        detail = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        detail = error.message;
      }
      toast("Error", { description: detail });
    }
  };

  const handleSave = async (data: AIProjectResponse) => {
    try {
      await createCardMutation.mutateAsync({
        ...data,
        deck_id: deckId,
      });
      setPreviewCard(null);
      setPrompt("");
      setManualTitle("");
      setManualCode("");
      setManualExplanation("");
      setManualTags("");
      toast("Saved", { description: "Flashcard added to your deck." });
    } catch (error: unknown) {
      let detail = "Failed to save card.";
      if (error instanceof AxiosError) {
        detail = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        detail = error.message;
      }
      toast("Error", { description: detail });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave({
      title: manualTitle,
      code_snippet: manualCode,
      explanation: manualExplanation,
      language: manualLanguage,
      tags: manualTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
    });
  };

  if (!isLoaded) return null;

  return (
    <Card className="overflow-hidden w-full border shadow-xl bg-card border-border">
      <CardHeader className="relative z-10 pb-4 border-b border-border bg-muted/30">
        <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex gap-2 items-center">
              {mode === "ai" ? (
                <Sparkles className="w-5 h-5 animate-pulse text-primary" />
              ) : (
                <PlusCircle className="w-5 h-5 text-secondary" />
              )}
              <HolographicText
                text={
                  mode === "ai" ? "AI Genius Generator" : "Draft a Manual Card"
                }
                size="sm"
              />
              {mode === "ai" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 rounded-full transition-colors hover:bg-primary/10"
                  onClick={() => router.push("/settings/ai")}
                >
                  <Settings2 className="w-3.5 h-3.5 text-primary/70" />
                </Button>
              )}
            </div>
            <NeonText
              text={
                mode === "ai"
                  ? apiKey
                    ? `Powered by ${PROVIDER_MODELS[activeProvider].name}`
                    : "Describe a concept and let AI do the heavy lifting."
                  : "Sometimes human touch is best."
              }
              color={mode === "ai" && !apiKey ? "red" : "cyan"}
              className="text-xs"
            />
          </div>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
            className="w-full sm:w-[200px]"
          >
            <TabsList className="grid grid-cols-2 w-full border bg-muted border-border">
              <TabsTrigger
                value="ai"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-transparent"
              >
                AI
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary border-transparent"
              >
                Manual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {mode === "ai" ? (
            <motion.div
              key="ai-mode"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Control Bar */}
              <div className="flex flex-wrap gap-3 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex gap-2 items-center px-3 h-8 border-border bg-background"
                    >
                      <Zap
                        className={cn(
                          "w-3 h-3",
                          apiKey ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="text-xs font-bold">
                        {PROVIDER_MODELS[activeProvider].name}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-48 bg-popover border-border"
                  >
                    <DropdownMenuLabel className="uppercase text-[10px] text-muted-foreground">
                      Configured Providers
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {configuredProviders.length > 0 ? (
                      configuredProviders.map((p) => (
                        <DropdownMenuItem
                          key={p}
                          onClick={() => setActiveProvider(p)}
                          className="flex justify-between items-center"
                        >
                          <span className="text-xs">
                            {PROVIDER_MODELS[p].name}
                          </span>
                          {activeProvider === p && (
                            <Sparkle className="w-3 h-3 text-primary fill-primary" />
                          )}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem
                        onClick={() => router.push("/settings/ai")}
                        className="text-xs italic text-muted-foreground"
                      >
                        No providers configured
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/settings/ai")}
                      className="text-xs font-bold text-primary"
                    >
                      Manage Keys...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex gap-2 items-center px-3 h-8 border-border bg-background"
                    >
                      <Cpu className="w-3 h-3 text-primary" />
                      <span className="font-mono text-xs">
                        {showCustomModelInput
                          ? customModelId || "Custom Model"
                          : activeModel}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="overflow-y-auto w-56 max-h-80 bg-popover border-border"
                  >
                    <DropdownMenuLabel className="uppercase text-[10px] text-muted-foreground">
                      {PROVIDER_MODELS[activeProvider].name} Models
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {PROVIDER_MODELS[activeProvider].models.map((m) => (
                      <DropdownMenuItem
                        key={m}
                        onClick={() => {
                          setLastUsedModel(activeProvider, m);
                          setShowCustomModelInput(false);
                        }}
                        className="flex justify-between items-center font-mono text-[10px]"
                      >
                        <span>{m}</span>
                        {activeModel === m && !showCustomModelInput && (
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowCustomModelInput(true)}
                      className="text-xs font-bold text-primary"
                    >
                      ✨ Other (Custom Model ID)...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {showCustomModelInput && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    className="flex-1 min-w-[150px]"
                  >
                    <Input
                      placeholder="Enter Model ID"
                      value={customModelId}
                      onChange={(e) => setCustomModelId(e.target.value)}
                      className="h-8 font-mono text-[10px] border-primary/50 bg-primary/5 focus:ring-primary/20"
                    />
                  </motion.div>
                )}
              </div>

              {!previewCard ? (
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="relative group">
                    {!apiKey ? (
                      <div
                        onClick={() => router.push("/settings/ai")}
                        className="flex gap-2 justify-center items-center h-12 rounded-xl border-2 border-dashed transition-all cursor-pointer bg-muted/50 border-border group hover:border-primary/50"
                      >
                        <Key className="w-4 h-4 animate-pulse text-muted-foreground group-hover:text-primary" />
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
                          Configure AI Credentials in Vault to Start Casting
                        </span>
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder={`Cast using ${showCustomModelInput ? customModelId : activeModel}...`}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          disabled={generateMutation.isPending}
                          className="pr-32 pl-4 h-12 rounded-xl border transition-all focus:ring-2 bg-input border-border focus:border-primary focus:ring-primary/20"
                        />
                        <div className="absolute top-1.5 right-1.5 bottom-1.5">
                          <Button
                            type="submit"
                            disabled={
                              generateMutation.isPending || !prompt.trim()
                            }
                            variant="cyber"
                            size="tech"
                            className="h-full"
                          >
                            {generateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Wand2 className="mr-2 w-4 h-4" />
                                Cast
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 space-y-4 rounded-xl border border-primary/20 bg-primary/5"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-4 items-center">
                      <span className="flex gap-2 items-center text-sm font-bold tracking-widest uppercase text-primary">
                        <Wand2 className="w-3.5 h-3.5" />
                        AI Prediction
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {previewCard.title}
                      </span>
                    </div>
                    <span className="py-1 px-2 font-mono uppercase rounded border text-[10px] text-muted-foreground bg-muted border-border">
                      {previewCard.language}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                        Code
                      </Label>
                      <CodeEditor
                        value={previewCard.code_snippet}
                        language={previewCard.language}
                        readOnly={true}
                        height="150px"
                        isZoomed={false}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                        Explanation
                      </Label>
                      <RichTextContent
                        content={previewCard.explanation}
                        isZoomed={false}
                        className="text-sm italic font-light leading-relaxed"
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-muted/50 text-foreground hover:bg-muted"
                        onClick={() => {
                          setMode("manual");
                          setManualTitle(previewCard.title);
                          setManualCode(previewCard.code_snippet);
                          setManualExplanation(previewCard.explanation);
                          setManualLanguage(
                            previewCard.language as SupportedLanguage,
                          );
                          setManualTags(previewCard.tags.join(", "));
                          setPreviewCard(null);
                        }}
                      >
                        <Edit2 className="mr-2 w-3.5 h-3.5" />
                        Refine
                      </Button>
                      <Button
                        variant="tech"
                        size="tech"
                        onClick={() => handleSave(previewCard)}
                        disabled={createCardMutation.isPending}
                      >
                        {createCardMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="mr-2 w-3.5 h-3.5" />
                        )}
                        Approve & Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="manual-mode"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleManualSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                  Title
                </Label>
                <Input
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. React Hooks: useEffect"
                  className="text-sm border bg-input border-border"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <span className="flex gap-1.5 items-center font-bold tracking-widest uppercase text-[10px] text-secondary">
                    <Globe className="w-3 h-3" />
                    Language
                  </span>
                  <Select
                    value={manualLanguage}
                    onValueChange={(v) =>
                      setManualLanguage(v as SupportedLanguage)
                    }
                  >
                    <SelectTrigger className="h-10 font-mono text-xs border bg-input border-border">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="border bg-popover border-border">
                      {Object.entries(LANGUAGE_MAP).map(([key, config]) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className="font-mono text-xs"
                        >
                          <div className="flex gap-2 items-center">
                            {config.icon && (
                              <Devicon
                                icon={config.icon}
                                size={12}
                                className={config.color}
                              />
                            )}
                            <span>{config.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="flex gap-1.5 items-center font-bold tracking-widest uppercase text-[10px] text-secondary">
                    <Tag className="w-3 h-3" />
                    Tags
                  </span>
                  <Input
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                    placeholder="hooks, state, react..."
                    className="h-10 text-xs border bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                  Code Snippet
                </Label>
                <CodeEditor
                  value={manualCode}
                  onChange={(v) => setManualCode(v || "")}
                  language={manualLanguage}
                  height="200px"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                  Explanation
                </Label>
                <RichTextEditor
                  value={manualExplanation}
                  onChange={setManualExplanation}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="matrix"
                  size="tech"
                  disabled={
                    createCardMutation.isPending ||
                    !manualTitle ||
                    !manualCode ||
                    !manualExplanation
                  }
                >
                  {createCardMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 w-4 h-4" />
                  )}
                  Save Flashy Card
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
