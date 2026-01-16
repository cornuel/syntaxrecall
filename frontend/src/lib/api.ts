import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor to attach JWT
client.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session && (session as any).backendToken) {
    config.headers.Authorization = `Bearer ${(session as any).backendToken}`;
  }
  return config;
});

// ===================== Schemas =====================
export const cardSchema = z.object({
  id: z.number(),
  deck_id: z.number(),
  code_snippet: z.string(),
  explanation: z.string(),
  language: z.string(),
  tags: z.array(z.string()),
  ease_factor: z.number(),
  interval: z.number(),
  repetitions: z.number(),
  next_review: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const cardCreateSchema = cardSchema.omit({
  id: true,
  ease_factor: true,
  interval: true,
  repetitions: true,
  next_review: true,
  created_at: true,
  updated_at: true,
});

export const cardUpdateSchema = cardCreateSchema.partial();

export const deckSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  is_public: z.boolean(),
  owner_id: z.number(),
  owner_username: z.string().optional().nullable(),
  likes_count: z.number().default(0),
  forks_count: z.number().default(0),
  parent_id: z.number().nullable().optional(),
  cards: z.array(cardSchema).optional(),
});

export const deckCreateSchema = deckSchema.omit({
  id: true,
  owner_id: true,
  cards: true,
});

export const deckUpdateSchema = deckCreateSchema.partial();

export const aiPromptRequestSchema = z.object({
  prompt: z.string(),
});

export const aiProjectResponseSchema = z.object({
  code_snippet: z.string(),
  explanation: z.string(),
  language: z.string(),
  tags: z.array(z.string()),
});

export const cardReviewSchema = z.object({
  rating: z.number().int().min(0).max(5),
});

export type Card = z.infer<typeof cardSchema>;
export type CardCreate = z.infer<typeof cardCreateSchema>;
export type CardUpdate = z.infer<typeof cardUpdateSchema>;
export type Deck = z.infer<typeof deckSchema>;
export type DeckCreate = z.infer<typeof deckCreateSchema>;
export type DeckUpdate = z.infer<typeof deckUpdateSchema>;
export type AIPromptRequest = z.infer<typeof aiPromptRequestSchema>;
export type AIProjectResponse = z.infer<typeof aiProjectResponseSchema>;
export type CardReview = z.infer<typeof cardReviewSchema>;

// ===================== Deck API =====================
/**
 * Hook to fetch all decks owned by the current user.
 */
export const useDecks = () => {
  return useQuery<Deck[]>({
    queryKey: ["decks"],
    queryFn: async () => {
      const response = await client.get("/decks");
      return z.array(deckSchema).parse(response.data);
    },
    staleTime: 30000,
    gcTime: 300000,
  });
};

export const useDeck = (deckId: number) => {
  return useQuery<Deck>({
    queryKey: ["decks", deckId],
    queryFn: async () => {
      const response = await client.get(`/decks/${deckId}`);
      return deckSchema.parse(response.data);
    },
    staleTime: 30000,
    gcTime: 300000,
  });
};

export const useCreateDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDeck: DeckCreate) => {
      const response = await client.post("/decks", newDeck);
      return deckSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export const useUpdateDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updatedDeck }: DeckUpdate & { id: number }) => {
      const response = await client.put(`/decks/${id}`, updatedDeck);
      return deckSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["deck"] });
    },
  });
};

export const useDeleteDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: number) => {
      await client.delete(`/decks/${deckId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export const useMarketplace = (search?: string) => {
  return useQuery<Deck[]>({
    queryKey: ["marketplace", search],
    queryFn: async () => {
      const response = await client.get("/decks/marketplace", {
        params: { search },
      });
      return z.array(deckSchema).parse(response.data);
    },
    staleTime: 60000,
  });
};

export const useForkDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: number) => {
      const response = await client.post(`/decks/${deckId}/fork`);
      return deckSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export const useLikeDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: number) => {
      await client.post(`/decks/${deckId}/like`);
    },
    onSuccess: (_, deckId) => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["decks", deckId] });
    },
  });
};

// ===================== Card API =====================
export const useCards = (deckId: number) => {
  return useQuery<Card[]>({
    queryKey: ["cards", deckId],
    queryFn: async () => {
      const response = await client.get(`/decks/${deckId}/cards`);
      return z.array(cardSchema).parse(response.data);
    },
    staleTime: 30000,
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCard: CardCreate) => {
      const response = await client.post("/cards", newCard);
      return cardSchema.parse(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards", data.deck_id] });
    },
  });
};

/**
 * Hook to submit a spaced-repetition review for a card.
 * @param cardId - The ID of the card being reviewed.
 * @param rating - SM-2 quality rating (0-5).
 */
export const useReviewCard = () => {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, rating }: { cardId: number; rating: number }) => {
      const response = await client.post(`/cards/${cardId}/review`, { rating });
      return cardSchema.parse(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards", data.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["cards", data.id] });
    },
  });
};

// ===================== AI API =====================
export const useGenerateAICard = () => {
  return useMutation({
    mutationFn: async (promptRequest: AIPromptRequest) => {
      const response = await client.post("/ai/generate", promptRequest);
      return aiProjectResponseSchema.parse(response.data);
    },
  });
};
