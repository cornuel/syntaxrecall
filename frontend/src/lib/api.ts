import axios from "axios";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { z, type ZodType } from "zod";
import { getSession, signOut } from "next-auth/react";

const API_BASE_URL = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const client = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor to attach JWT
client.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }
  return config;
});

// Add interceptor to handle 401 Unauthorized responses
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session is invalid or expired
      await signOut({ callbackUrl: "/login" }); // Redirect to signin page
    }
    return Promise.reject(error);
  }
);

// ===================== Schemas =====================
export const cardSchema = z.object({
  id: z.number(),
  deck_id: z.number(),
  title: z.string(),
  code_snippet: z.string(),
  explanation: z.string(),
  language: z.string(),
  tags: z.array(z.string()),
  roadmap_id: z.string().optional().nullable(),
  roadmap_title: z.string().optional().nullable(),
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
  rating_avg: z.number().default(0),
  rating_count: z.number().default(0),
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
  title: z.string(),
  code_snippet: z.string(),
  explanation: z.string(),
  language: z.string(),
  tags: z.array(z.string()),
  roadmap_id: z.string().optional().nullable(),
  roadmap_title: z.string().optional().nullable(),
});

export const cardReviewSchema = z.object({
  rating: z.number().int().min(0).max(5),
});

export const reviewSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  deck_id: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const reviewCreateSchema = reviewSchema.pick({
  rating: true,
  comment: true,
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
export type Review = z.infer<typeof reviewSchema>;
export type ReviewCreate = z.infer<typeof reviewCreateSchema>;

// ===================== Roadmap Schemas =====================
export interface RoadmapNode {
  id: string;
  label: string;
  description?: string;
  tags: string[];
  roadmap_ref?: string;
  children?: RoadmapNode[];
}

export const roadmapNodeSchema: ZodType<RoadmapNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    roadmap_ref: z.string().optional(),
    children: z.array(roadmapNodeSchema).optional(),
  })
);

export const roadmapSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.string(),
  description: z.string().nullable(),
  content: z.object({
    id: z.string(),
    title: z.string(),
    version: z.string(),
    description: z.string().optional(),
    root: roadmapNodeSchema,
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

export const nodeMasterySchema = z.object({
  node_id: z.string(),
  mastery_percentage: z.number(),
  total_cards: z.number(),
  mastered_cards: z.number(),
});

export type Roadmap = z.infer<typeof roadmapSchema>;
export type NodeMastery = z.infer<typeof nodeMasterySchema>;

export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  github_id: z.string().nullable().optional(),
});

export const userProfileSchema = userResponseSchema.extend({
  total_decks: z.number(),
  total_cards: z.number(),
  public_decks: z.number(),
  roadmap_subscriptions_count: z.number(),
});

export type User = z.infer<typeof userResponseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

export interface FilterState {
  search: string;
  language: string;
  tags: string[];
}

// ===================== User API =====================
/**
 * Fetches the current user's profile, including contribution stats and 
 * roadmap progress. Used by the 'Technical Librarian' dashboard.
 */
export const useMe = () => {
  return useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await client.get("/auth/me");
      return userProfileSchema.parse(response.data);
    },
    staleTime: 60000,
  });
};

// ===================== Deck API =====================
/**
 * Hook to fetch all decks owned by the current user.
 */
export const useDecks = (filters?: FilterState) => {
  return useQuery<Deck[]>({
    queryKey: ["decks", filters],
    queryFn: async () => {
      const response = await client.get("/decks", {
        params: {
          title__ilike: filters?.search,
          ...filters,
        },
      });
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

export const useMarketplace = (filters?: FilterState) => {
  return useQuery<Deck[]>({
    queryKey: ["marketplace", filters],
    queryFn: async () => {
      const response = await client.get("/decks/marketplace", {
        params: {
          search: filters?.search,
          title__ilike: filters?.search,
          language: filters?.language,
          is_public: true,
        },
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

// ===================== Review API =====================
export const useReviews = (deckId: number) => {
  return useQuery<Review[]>({
    queryKey: ["reviews", deckId],
    queryFn: async () => {
      const response = await client.get(`/decks/${deckId}/reviews`);
      return z.array(reviewSchema).parse(response.data);
    },
    staleTime: 60000,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deckId,
      review,
    }: {
      deckId: number;
      review: ReviewCreate;
    }) => {
      const response = await client.post(`/decks/${deckId}/reviews`, review);
      return reviewSchema.parse(response.data);
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks", deckId] });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
};

// ===================== Card API =====================
/**
 * Fetches cards with optional deck filtering and advanced search.
 * Supports fuzzy search via 'search', language filtering, and tag-based discovery.
 */
export const useCards = (deckId?: number, filters?: FilterState) => {
  return useQuery<Card[]>({
    queryKey: ["cards", deckId, filters],
    queryFn: async () => {
      const url = deckId ? `/decks/${deckId}/cards` : "/cards/";
      
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.language) params.append("language", filters.language);
      if (filters?.tags) {
        filters.tags.forEach(tag => params.append("tags__contains", tag));
      }

      const response = await client.get(url, { params });
      return z.array(cardSchema).parse(response.data);
    },
    placeholderData: keepPreviousData,
    enabled: true,
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
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards", data.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] }); // Refresh mastery
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

export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updatedCard
    }: CardUpdate & { id: number }) => {
      const response = await client.put(`/cards/${id}`, updatedCard);
      return cardSchema.parse(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards", data.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cardId: number) => {
      await client.delete(`/cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
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

// ===================== Roadmap API =====================
export const useRoadmaps = () => {
  return useQuery<Roadmap[]>({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const response = await client.get("/roadmaps");
      return z.array(roadmapSchema).parse(response.data);
    },
  });
};

export const useUserRoadmaps = () => {
  return useQuery<Roadmap[]>({
    queryKey: ["roadmaps", "subscriptions"],
    queryFn: async () => {
      const response = await client.get("/roadmaps/subscriptions");
      return z.array(roadmapSchema).parse(response.data);
    },
  });
};

export const useRoadmap = (id: string) => {
  return useQuery<Roadmap>({
    queryKey: ["roadmaps", id],
    queryFn: async () => {
      const response = await client.get(`/roadmaps/${id}`);
      return roadmapSchema.parse(response.data);
    },
    enabled: !!id,
  });
};

export const useSubscribeRoadmap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, includeDefaultCards = false }: { id: string, includeDefaultCards?: boolean }) => {
      await client.post(`/roadmaps/${id}/subscribe`, null, {
        params: { include_default_cards: includeDefaultCards }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export const useUnsubscribeRoadmap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/roadmaps/${id}/unsubscribe`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

/**
 * Fetches mastery statistics for each node in a roadmap.
 * Mastery is calculated based on the performance of cards linked to each node 
 * using the SM-2 algorithm stats.
 */
export const useRoadmapMastery = (id: string) => {
  return useQuery<NodeMastery[]>({
    queryKey: ["roadmaps", id, "mastery"],
    queryFn: async () => {
      const response = await client.get(`/roadmaps/${id}/mastery`);
      return z.array(nodeMasterySchema).parse(response.data);
    },
    enabled: !!id,
    refetchInterval: 10000, // Refresh mastery periodically
  });
};
