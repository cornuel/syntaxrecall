"use client";

import { useState } from "react";
import { useAISettings, type AIProvider, type AIConfig } from "@/hooks/use-ai-settings";
import { useTestAIConnection } from "@/lib/api";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
    BrainCircuit, 
    ShieldCheck, 
    CheckCircle2, 
    Loader2, 
    Zap, 
    ChevronRight, 
    Settings2, 
    Key, 
    PlusCircle,
    Info,
    Cpu
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const PROVIDER_MODELS: Record<AIProvider, { name: string; icon: string; models: string[] }> = {
    gemini: {
        name: "Google Gemini",
        icon: "google",
        models: [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-3-flash-preview",
            "gemini-3-pro-preview",
        ],
    },
    openai: {
        name: "OpenAI",
        icon: "openai",
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
        name: "Anthropic Claude",
        icon: "anthropic",
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
        name: "Groq (Llama/Mixtral)",
        icon: "groq",
        models: [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
        ],
    },
    qwen: {
        name: "Alibaba Qwen",
        icon: "qwen",
        models: ["qwen-plus", "qwen-max", "qwen-turbo"],
    },
};

export default function AISettingsPage() {
    const { settings, setProviderConfig, setActiveProvider, isLoaded } = useAISettings();
    const testMutation = useTestAIConnection();

    if (!isLoaded) return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    const activeProvider = settings.activeProvider;

    const handleTest = async (provider: AIProvider, config: AIConfig) => {
        if (!config.apiKey) {
            toast.error("API Key Required", { description: `Please enter a key for ${PROVIDER_MODELS[provider].name}.` });
            return;
        }

        try {
            await testMutation.mutateAsync({
                provider,
                api_key: config.apiKey,
                model: config.model,
            });
            toast.success("Connection Verified", { 
                description: `Successfully connected to ${PROVIDER_MODELS[provider].name} using ${config.model}`,
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
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="space-y-4 text-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2"
                    >
                        <BrainCircuit className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        AI Architect Settings
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
                        Configure your technical brain. Select a provider, enter your key, and define your mastery model.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Provider Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Available Brains</h2>
                        <div className="space-y-2">
                            {(Object.entries(PROVIDER_MODELS) as [AIProvider, any][]).map(([id, info]) => {
                                const isActive = activeProvider === id;
                                const isConfigured = !!settings.configs[id].apiKey;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => setActiveProvider(id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group",
                                            isActive 
                                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                                                : "bg-card border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                                            )}>
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className={cn("text-sm font-bold", isActive ? "text-primary" : "text-foreground")}>{info.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                                                    {isConfigured ? "Configured" : "Needs Key"}
                                                </p>
                                            </div>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border mt-8">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-tight">Privacy Guaranteed</p>
                                    <p className="text-[10px] text-muted-foreground leading-normal">
                                        Your API keys are stored exclusively in your browser's LocalStorage. They never persist on our servers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Configuration Area */}
                    <div className="lg:col-span-2">
                        <motion.div
                            key={activeProvider}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="border-border shadow-xl bg-card overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl flex items-center gap-2">
                                                <Settings2 className="w-6 h-6 text-primary" />
                                                {PROVIDER_MODELS[activeProvider].name}
                                            </CardTitle>
                                            <CardDescription>Configure the engine for technical card generation.</CardDescription>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-8">
                                    {/* API Key Input */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="apiKey" className="text-sm font-bold flex items-center gap-2">
                                                <Key className="w-4 h-4 text-primary" />
                                                API Key
                                            </Label>
                                        </div>
                                        <Input
                                            id="apiKey"
                                            type="password"
                                            placeholder={`Paste your ${PROVIDER_MODELS[activeProvider].name} secret key here`}
                                            value={settings.configs[activeProvider].apiKey}
                                            onChange={(e) => setProviderConfig(activeProvider, { ...settings.configs[activeProvider], apiKey: e.target.value })}
                                            className="bg-muted/30 border-border h-12 focus:ring-primary/20"
                                        />
                                    </div>

                                    {/* Model Selection */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-primary" />
                                            Model Selection
                                        </Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Presets</p>
                                                <Select 
                                                    value={settings.configs[activeProvider].isCustomModel ? "custom" : settings.configs[activeProvider].model} 
                                                    onValueChange={(val) => {
                                                        if (val === "custom") {
                                                            setProviderConfig(activeProvider, { ...settings.configs[activeProvider], isCustomModel: true });
                                                        } else {
                                                            setProviderConfig(activeProvider, { ...settings.configs[activeProvider], model: val, isCustomModel: false });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-muted/30 border-border font-mono text-xs h-12">
                                                        <SelectValue placeholder="Choose a model" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-popover border-border">
                                                        {PROVIDER_MODELS[activeProvider].models.map(m => (
                                                            <SelectItem key={m} value={m} className="font-mono text-xs">{m}</SelectItem>
                                                        ))}
                                                        <SelectItem value="custom" className="font-bold text-primary">✨ Custom Model ID...</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {settings.configs[activeProvider].isCustomModel && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Custom Model ID</p>
                                                    <Input 
                                                        placeholder="e.g. gpt-5-turbo-pro"
                                                        value={settings.configs[activeProvider].model}
                                                        onChange={(e) => setProviderConfig(activeProvider, { ...settings.configs[activeProvider], model: e.target.value })}
                                                        className="bg-primary/5 border-primary/30 h-12 font-mono text-xs focus:ring-primary/20"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Info className="w-3.5 h-3.5" />
                                            <p className="text-[10px]">
                                                {settings.configs[activeProvider].isCustomModel 
                                                    ? "Using manually entered model ID. Ensure the ID is valid for the provider." 
                                                    : "Recommended for optimal balance between cost and technical accuracy."}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 border-t border-border p-6 flex flex-col sm:flex-row gap-4">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 h-12 border-border bg-muted/50 hover:bg-muted"
                                        onClick={() => handleTest(activeProvider, settings.configs[activeProvider])}
                                        disabled={testMutation.isPending}
                                    >
                                        {testMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                                        Test This Brain
                                    </Button>
                                    <Button 
                                        className="flex-1 h-12 shadow-lg shadow-primary/20"
                                        onClick={() => toast.success("Settings Preserved", { description: `${PROVIDER_MODELS[activeProvider].name} is now your primary engine.` })}
                                    >
                                        Lock Configuration
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
