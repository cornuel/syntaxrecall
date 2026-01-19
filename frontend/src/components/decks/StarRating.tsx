"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/lib/api";
import { toast } from "sonner";

interface StarRatingProps {
  deckId: number;
  initialRating?: number;
  onSuccess?: () => void;
}

export function StarRating({ deckId, initialRating = 0, onSuccess }: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await createReview.mutateAsync({
        deckId,
        review: { rating, comment },
      });
      toast.success("Review submitted!");
      setComment("");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-400">Rate this deck</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform active:scale-90"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  (hover || rating) >= star
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-slate-600"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">
          Comment (optional)
        </label>
        <Textarea
          placeholder="What did you think of this deck?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-slate-950 border-slate-800 resize-none"
          rows={3}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={createReview.isPending}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold"
      >
        {createReview.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}
