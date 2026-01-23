"use client";

import { useState } from "react";
import { useGenerateAICard, useCreateCard, type AIProjectResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/editors/CodeEditor";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Sparkles, PlusCircle, Save, Edit2, Wand2, Tag, Globe } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGE_MAP, type SupportedLanguage, cn } from "@/lib/utils";
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

interface GeneratorProps {
    deckId: number;
}

type Mode = "ai" | "manual";

export function Generator({ deckId }: GeneratorProps) {
    const [mode, setMode] = useState<Mode>("ai");
    const [prompt, setPrompt] = useState("");
    const [previewCard, setPreviewCard] = useState<AIProjectResponse | null>(null);

    const [manualTitle, setManualTitle] = useState("");
    const [manualCode, setManualCode] = useState("");
    const [manualExplanation, setManualExplanation] = useState("");
    const [manualLanguage, setManualLanguage] = useState<SupportedLanguage>("js");
    const [manualTags, setManualTags] = useState("");

    const generateMutation = useGenerateAICard();
    const createCardMutation = useCreateCard();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        try {
            const generated = await generateMutation.mutateAsync({ prompt });
            setPreviewCard(generated);
            toast("Success", { description: "AI generated a card preview for you." });
        } catch (error: any) {
            const detail = error.response?.data?.detail || error.message || "AI failed to generate content.";
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
        } catch (error: any) {
            toast("Error", { description: "Failed to save card." });
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSave({
            title: manualTitle,
            code_snippet: manualCode,
            explanation: manualExplanation,
            language: manualLanguage,
            tags: manualTags.split(",").map(t => t.trim()).filter(t => t !== ""),
        });
    };

    return (
        <Card className="w-full bg-card border border-border shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border pb-4 bg-muted/30 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {mode === "ai" ? (
                                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            ) : (
                                <PlusCircle className="w-5 h-5 text-secondary" />
                            )}
                            <HolographicText text={mode === "ai" ? "AI Genius Generator" : "Draft a Manual Card"} size="sm" />
                        </div>
                        <NeonText text={mode === "ai" ? "Describe a concept and let AI do the heavy lifting." : "Sometimes human touch is best."} color="cyan" className="text-xs" />
                    </div>
                    <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full sm:w-[200px]">
                        <TabsList className="grid w-full grid-cols-2 bg-muted border border-border">
                            <TabsTrigger value="ai" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-transparent">AI</TabsTrigger>
                            <TabsTrigger value="manual" className="data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary border-transparent">Manual</TabsTrigger>
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
                        >
                            {!previewCard ? (
                                <form onSubmit={handleGenerate} className="space-y-4">
                                    <div className="relative group">
                                        <Input
                                            placeholder="e.g. How do I use React.memo effectively?"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            disabled={generateMutation.isPending}
                                            className="bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 pl-4 pr-32 transition-all rounded-xl"
                                        />
                                        <div className="absolute right-1.5 top-1.5 bottom-1.5">
                                            <Button
                                                type="submit"
                                                disabled={generateMutation.isPending || !prompt.trim()}
                                                variant="cyber"
                                                size="tech"
                                                className="h-full"
                                            >
                                                {generateMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Wand2 className="w-4 h-4 mr-2" />
                                                        Cast
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                                                <Wand2 className="w-3.5 h-3.5" />
                                                AI Prediction
                                            </span>
                                            <span className="text-xs font-bold text-foreground">{previewCard.title}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-2 py-1 rounded border border-border">{previewCard.language}</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Code</Label>
                                            <CodeEditor 
                                                value={previewCard.code_snippet}
                                                language={previewCard.language}
                                                readOnly={true}
                                                height="150px"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Explanation</Label>
                                            <RichTextContent 
                                                content={previewCard.explanation} 
                                                className="text-sm font-light italic leading-relaxed" 
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-border bg-muted/50 hover:bg-muted text-foreground"
                                                onClick={() => {
                                                    setMode("manual");
                                                    setManualTitle(previewCard.title);
                                                    setManualCode(previewCard.code_snippet);
                                                    setManualExplanation(previewCard.explanation);
                                                    setManualLanguage(previewCard.language as SupportedLanguage);
                                                    setManualTags(previewCard.tags.join(", "));
                                                    setPreviewCard(null);
                                                }}
                                            >
                                                <Edit2 className="w-3.5 h-3.5 mr-2" />
                                                Refine
                                            </Button>
                                            <Button
                                                variant="tech"
                                                size="tech"
                                                onClick={() => handleSave(previewCard)}
                                                disabled={createCardMutation.isPending}
                                            >
                                                {createCardMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
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
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Title</Label>
                                <Input
                                    value={manualTitle}
                                    onChange={(e) => setManualTitle(e.target.value)}
                                    placeholder="e.g. React Hooks: useEffect"
                                    className="bg-input border border-border text-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 text-secondary">
                                        <Globe className="w-3 h-3" />
                                        Language
                                    </span>
                                    <Select value={manualLanguage} onValueChange={(v) => setManualLanguage(v as SupportedLanguage)}>
                                        <SelectTrigger className="bg-input border border-border h-10 font-mono text-xs">
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border border-border">
                                            {Object.entries(LANGUAGE_MAP).map(([key, config]) => (
                                                <SelectItem key={key} value={key} className="text-xs font-mono">
                                                    <div className="flex items-center gap-2">
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
                                    <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 text-secondary">
                                        <Tag className="w-3 h-3" />
                                        Tags
                                    </span>
                                    <Input
                                        value={manualTags}
                                        onChange={(e) => setManualTags(e.target.value)}
                                        placeholder="hooks, state, react..."
                                        className="bg-input border border-border h-10 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Code Snippet</Label>
                                <CodeEditor
                                    value={manualCode}
                                    onChange={(v) => setManualCode(v || "")}
                                    language={manualLanguage}
                                    height="200px"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Explanation</Label>
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
                                    disabled={createCardMutation.isPending || !manualTitle || !manualCode || !manualExplanation}
                                >
                                    {createCardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
