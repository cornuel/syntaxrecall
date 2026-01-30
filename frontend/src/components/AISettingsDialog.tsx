"use client";

import { useState } from "react";
import { useAISettings, type AIProvider } from "@/hooks/use-ai-settings";
import { useTestAIConnection } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Settings2, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

const PROVIDER_MODELS: Record<AIProvider, { name: string; models: string[] }> = {
    gemini: {
        name: "Google Gemini",
        models: [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-3-flash-preview", // Requested future/speculative
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
            "gpt-5-mini-preview", // Requested future
            "gpt-5.2-nano-preview",
            "gpt-5.2-pro-preview",
        ],
    },
    anthropic: {
        name: "Anthropic Claude",
        models: [
            "claude-3-5-sonnet-latest",
            "claude-3-5-haiku-latest",
            "claude-3-opus-latest",
            "claude-4.5-sonnet-preview", // Requested future
            "claude-4.5-haiku-preview",
            "claude-4.5-opus-preview",
        ],
    },
    groq: {
        name: "Groq (Llama/Mixtral)",
        models: [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
        ],
    },
    qwen: {
        name: "Alibaba Qwen",
        models: ["qwen-plus", "qwen-max", "qwen-turbo"],
    },
};

interface AISettingsDialogProps {
    trigger?: React.ReactNode;
}

export function AISettingsDialog({ trigger }: AISettingsDialogProps) {
    const { settings, setProviderConfig, setActiveProvider } = useAISettings();
    const testMutation = useTestAIConnection();
    const [isOpen, setIsOpen] = useState(false);

    const activeProvider = settings.activeProvider;
    const config = settings.configs[activeProvider];

    const handleKeyChange = (val: string) => {
        setProviderConfig(activeProvider, { ...config, apiKey: val });
    };

    const handleModelChange = (val: string) => {
        setProviderConfig(activeProvider, { ...config, model: val });
    };

    const handleTest = async () => {
        if (!config.apiKey) {
            toast.error("API Key Required", { description: "Please enter an API key first." });
            return;
        }

        try {
            await testMutation.mutateAsync({
                provider: activeProvider,
                api_key: config.apiKey,
                model: config.model,
            });
            toast.success("Connection Verified", { 
                description: `Successfully connected to ${PROVIDER_MODELS[activeProvider].name}`,
                icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
            });
        } catch (error) {
            let detail = "Check your key and model selection.";
            if (error instanceof AxiosError) {
                detail = error.response?.data?.detail || error.message;
            }
            toast.error("Connection Failed", { description: detail });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Settings2 className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        AI Architect Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure your personal AI credentials. Keys are stored locally in your browser.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select value={activeProvider} onValueChange={(v) => setActiveProvider(v as AIProvider)}>
                            <SelectTrigger className="bg-muted/50 border-border">
                                <SelectValue placeholder="Select Provider" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                {Object.entries(PROVIDER_MODELS).map(([id, info]) => (
                                    <SelectItem key={id} value={id}>
                                        {info.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Model</Label>
                        <Select value={config.model} onValueChange={handleModelChange}>
                            <SelectTrigger className="bg-muted/50 border-border font-mono text-xs">
                                <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                {PROVIDER_MODELS[activeProvider].models.map((m) => (
                                    <SelectItem key={m} value={m} className="font-mono text-xs">
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Default models are cost-optimized.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="apiKey">API Key</Label>
                            <span className="text-[10px] uppercase font-bold text-primary/60 tracking-tighter">Encrypted at rest (Local)</span>
                        </div>
                        <Input
                            id="apiKey"
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => handleKeyChange(e.target.value)}
                            placeholder={`Enter your ${PROVIDER_MODELS[activeProvider].name} Key`}
                            className="bg-muted/50 border-border focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={handleTest} 
                        disabled={testMutation.isPending}
                        variant="secondary"
                        className="w-full border border-border"
                    >
                        {testMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                    </Button>
                    <Button onClick={() => setIsOpen(false)} className="w-full">
                        Save Configuration
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
