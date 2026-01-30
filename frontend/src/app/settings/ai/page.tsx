"use client";

import { useAISettings, type AIProvider } from "@/hooks/use-ai-settings";
import { useTestAIConnection } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
    BrainCircuit, 
    ShieldCheck, 
    CheckCircle2, 
    Loader2, 
    Key, 
    Zap,
    Lock
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const PROVIDERS: Record<AIProvider, { name: string; testModel: string }> = {
    gemini: { name: "Google Gemini", testModel: "gemini-1.5-flash" },
    openai: { name: "OpenAI", testModel: "gpt-4o-mini" },
    anthropic: { name: "Anthropic Claude", testModel: "claude-3-5-haiku-latest" },
    groq: { name: "Groq", testModel: "llama-3.1-8b-instant" },
    qwen: { name: "Alibaba Qwen", testModel: "qwen-plus" },
};

export default function AISettingsPage() {
    const { settings, setProviderKey, isLoaded } = useAISettings();
    const testMutation = useTestAIConnection();

    if (!isLoaded) return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    const handleTest = async (provider: AIProvider, apiKey: string) => {
        if (!apiKey) {
            toast.error("API Key Required", { description: `Please enter a key for ${PROVIDERS[provider].name}.` });
            return;
        }

        try {
            await testMutation.mutateAsync({
                provider,
                api_key: apiKey,
                model: PROVIDERS[provider].testModel,
            });
            toast.success("Key Verified", { 
                description: `Connection to ${PROVIDERS[provider].name} is active.`,
                icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
            });
        } catch (error) {
            let detail = "Ensure the key is valid and has sufficient credits.";
            if (error instanceof AxiosError) {
                detail = error.response?.data?.detail || error.message;
            }
            toast.error("Verification Failed", { description: detail });
        }
    };

    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4 text-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2"
                    >
                        <Lock className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        AI API Vault
                    </h1>
                    <p className="max-w-xl mx-auto text-muted-foreground">
                        Securely manage your API keys. All keys are stored locally on your device.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.entries(PROVIDERS) as [AIProvider, any][]).map(([id, info]) => (
                        <Card key={id} className="border-border bg-card/50 hover:bg-card transition-colors overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className={cn("w-4 h-4", settings.keys[id] ? "text-primary" : "text-muted-foreground")} />
                                        {info.name}
                                    </CardTitle>
                                    {settings.keys[id] && (
                                        <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                            <span className="text-[10px] font-bold text-primary uppercase">Configured</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`key-${id}`} className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                        Secret Key
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id={`key-${id}`}
                                            type="password"
                                            placeholder={`Enter ${info.name} Key`}
                                            value={settings.keys[id]}
                                            onChange={(e) => setProviderKey(id, e.target.value)}
                                            className="bg-background/50 border-border pr-10"
                                        />
                                        <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 pt-4 flex justify-end">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-xs font-bold uppercase tracking-tight"
                                    onClick={() => handleTest(id, settings.keys[id])}
                                    disabled={testMutation.isPending}
                                >
                                    {testMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldCheck className="w-3 h-3 mr-2" />}
                                    Verify Key
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                    <BrainCircuit className="w-6 h-6 text-primary shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold">How it works</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Once you provide a key here, that provider becomes available in the <strong>AI Genius Generator</strong> across your technical decks. You can then select specific models (like GPT-4o or Claude 3.5 Sonnet) directly in the generator UI.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
