"use client";

import { useState } from "react";
import { useAISettings, type AIProvider } from "@/hooks/use-ai-settings";
import { useTestAIConnection } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Zap,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const PROVIDERS: Record<
  AIProvider,
  { name: string; testModel: string; link: string }
> = {
  gemini: {
    name: "Google Gemini",
    testModel: "gemini-2.5-flash-lite",
    link: "https://aistudio.google.com/app/apikey",
  },
  openai: {
    name: "OpenAI",
    testModel: "gpt-4o-mini",
    link: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    name: "Anthropic Claude",
    testModel: "claude-3-5-haiku-latest",
    link: "https://console.anthropic.com/settings/keys",
  },
  groq: {
    name: "Groq",
    testModel: "llama-3.1-8b-instant",
    link: "https://console.groq.com/keys",
  },
  qwen: {
    name: "Alibaba Qwen",
    testModel: "qwen-plus",
    link: "https://dashscope.console.aliyun.com/apiKey",
  },
};

export default function AISettingsPage() {
  const { settings, setProviderKey, isLoaded } = useAISettings();
  const testMutation = useTestAIConnection();

  // UI States
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [verifyingProviders, setVerifyingProviders] = useState<Set<string>>(
    new Set(),
  );

  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const toggleKeyVisibility = (id: string) => {
    const next = new Set(visibleKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleKeys(next);
  };

  const handleTest = async (provider: AIProvider, apiKey: string) => {
    if (!apiKey) {
      toast.error("API Key Required", {
        description: `Please enter a key for ${PROVIDERS[provider].name}.`,
      });
      return;
    }

    setVerifyingProviders((prev) => new Set(prev).add(provider));
    try {
      await testMutation.mutateAsync({
        provider,
        api_key: apiKey,
        model: PROVIDERS[provider].testModel,
      });
      toast.success("Key Verified", {
        description: `Connection to ${PROVIDERS[provider].name} is active.`,
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      });
    } catch (error) {
      let detail = "Ensure the key is valid and has sufficient credits.";
      if (error instanceof AxiosError) {
        detail = error.response?.data?.detail || error.message;
      }
      toast.error("Verification Failed", { description: detail });
    } finally {
      setVerifyingProviders((prev) => {
        const next = new Set(prev);
        next.delete(provider);
        return next;
      });
    }
  };

  return (
    <div className="py-16 px-4 min-h-screen bg-background">
      <div className="mx-auto space-y-12 max-w-3xl">
        <header className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex justify-center items-center p-3 mb-2 rounded-2xl bg-primary/10"
          >
            <Lock className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            AI API Vault
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your local keys. They are never sent to our servers.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border shadow-sm bg-card border-border">
          <div className="divide-y divide-border">
            {(
              Object.entries(PROVIDERS) as [
                AIProvider,
                { name: string; testModel: string; link: string },
              ][]
            ).map(([id, info]) => {
              const isVerifying = verifyingProviders.has(id);
              const isVisible = visibleKeys.has(id);
              const hasKey = !!settings.keys[id];

              return (
                <div
                  key={id}
                  className="flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:p-6 hover:bg-muted/30"
                >
                  <div className="flex gap-3 items-center w-full sm:w-40 shrink-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        hasKey
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-bold leading-none">
                        {info.name}
                      </p>
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-1 items-center transition-colors text-[10px] text-muted-foreground hover:text-primary"
                      >
                        Get Key <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-1 gap-2 items-center">
                    <div className="relative flex-1">
                      <Input
                        type={isVisible ? "text" : "password"}
                        placeholder={`Enter ${info.name} Key`}
                        value={settings.keys[id]}
                        onChange={(e) => setProviderKey(id, e.target.value)}
                        className="pr-10 h-9 font-mono text-xs bg-background/50 border-border"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(id)}
                        className="absolute right-3 top-1/2 transition-colors -translate-y-1/2 text-muted-foreground/50 hover:text-primary"
                      >
                        {isVisible ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="px-4 h-9 text-xs font-bold"
                      onClick={() => handleTest(id, settings.keys[id])}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="mr-2 w-3.5 h-3.5" />
                      )}
                      Verify
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 items-start p-6 rounded-2xl border bg-primary/5 border-primary/10">
          <BrainCircuit className="w-5 h-5 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Privacy Control</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              These keys enable the <strong>AI Genius Generator</strong>. Switch
              between providers and specific models directly in the generation
              UI when creating new cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
