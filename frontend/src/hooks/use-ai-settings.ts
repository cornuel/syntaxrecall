"use client";

import { useState, useEffect } from "react";

export type AIProvider = "openai" | "anthropic" | "gemini" | "groq" | "qwen";

export interface AISettings {
    activeProvider: AIProvider;
    keys: Record<AIProvider, string>;
    lastUsedModel: Record<AIProvider, string>;
}

const DEFAULT_SETTINGS: AISettings = {
    activeProvider: "gemini",
    keys: {
        openai: "",
        anthropic: "",
        gemini: "",
        groq: "",
        qwen: "",
    },
    lastUsedModel: {
        openai: "gpt-4o-mini",
        anthropic: "claude-3-5-sonnet-latest",
        gemini: "gemini-1.5-flash",
        groq: "llama-3.3-70b-versatile",
        qwen: "qwen-plus",
    }
};

export function useAISettings() {
    const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("syntaxrecall_ai_settings");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migration support: handle old format if it exists
                if (parsed.configs) {
                    const migratedKeys: any = {};
                    const migratedModels: any = {};
                    Object.keys(parsed.configs).forEach(k => {
                        migratedKeys[k] = parsed.configs[k].apiKey || "";
                        migratedModels[k] = parsed.configs[k].model || DEFAULT_SETTINGS.lastUsedModel[k as AIProvider];
                    });
                    setSettings({
                        activeProvider: parsed.activeProvider || "gemini",
                        keys: migratedKeys,
                        lastUsedModel: migratedModels
                    });
                } else {
                    setSettings(parsed);
                }
            } catch (e) {
                console.error("Failed to parse AI settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const updateSettings = (newSettings: AISettings) => {
        setSettings(newSettings);
        localStorage.setItem("syntaxrecall_ai_settings", JSON.stringify(newSettings));
    };

    const setProviderKey = (provider: AIProvider, key: string) => {
        const newSettings = {
            ...settings,
            keys: {
                ...settings.keys,
                [provider]: key,
            },
        };
        updateSettings(newSettings);
    };

    const setLastUsedModel = (provider: AIProvider, model: string) => {
        const newSettings = {
            ...settings,
            lastUsedModel: {
                ...settings.lastUsedModel,
                [provider]: model,
            },
        };
        updateSettings(newSettings);
    };

    const setActiveProvider = (provider: AIProvider) => {
        updateSettings({ ...settings, activeProvider: provider });
    };

    return {
        settings,
        updateSettings,
        setProviderKey,
        setLastUsedModel,
        setActiveProvider,
        isLoaded,
        apiKey: settings.keys[settings.activeProvider],
    };
}
