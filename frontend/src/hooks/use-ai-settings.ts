"use client";

import { useState, useEffect } from "react";

export type AIProvider = "openai" | "anthropic" | "gemini" | "groq" | "qwen";

export interface AIConfig {
    apiKey: string;
    model: string;
    isCustomModel?: boolean;
}

export interface AISettings {
    activeProvider: AIProvider;
    configs: Record<AIProvider, AIConfig>;
}

const DEFAULT_SETTINGS: AISettings = {
    activeProvider: "gemini",
    configs: {
        openai: { apiKey: "", model: "gpt-4o-mini", isCustomModel: false },
        anthropic: { apiKey: "", model: "claude-3-5-sonnet-latest", isCustomModel: false },
        gemini: { apiKey: "", model: "gemini-2.0-flash", isCustomModel: false },
        groq: { apiKey: "", model: "llama-3.3-70b-versatile", isCustomModel: false },
        qwen: { apiKey: "", model: "qwen-plus", isCustomModel: false },
    },
};

export function useAISettings() {
    const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("syntaxrecall_ai_settings");
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
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

    const setProviderConfig = (provider: AIProvider, config: AIConfig) => {
        const newSettings = {
            ...settings,
            configs: {
                ...settings.configs,
                [provider]: config,
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
        setProviderConfig,
        setActiveProvider,
        isLoaded,
        activeConfig: settings.configs[settings.activeProvider],
    };
}
