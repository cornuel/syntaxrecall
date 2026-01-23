"use client";

import { useState } from "react";
import { useUpdateCard, type Card, type CardUpdate } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/editors/CodeEditor";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { Label } from "@/components/ui/label";
import { LANGUAGE_MAP, type SupportedLanguage } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Devicon } from "@/components/devicon";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface EditCardDialogProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCardDialog({ card, isOpen, onClose }: EditCardDialogProps) {
  const [title, setTitle] = useState(card.title || "Untitled Card");
  const [code, setCode] = useState(card.code_snippet);
  const [explanation, setExplanation] = useState(card.explanation);
  const [language, setLanguage] = useState<SupportedLanguage>(card.language as SupportedLanguage);
  const [tags, setTags] = useState(card.tags.join(", "));

  const updateMutation = useUpdateCard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: card.id,
        title,
        code_snippet: code,
        explanation,
        language,
        tags: tags.split(",").map(t => t.trim()).filter(t => t !== ""),
      });
      toast.success("Card updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update card.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Flashcard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Hooks: useEffect"
              className="bg-background border-border h-10 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
                <SelectTrigger className="bg-background border-border h-10 font-mono text-xs">
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
              <Label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Tags (comma separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="hooks, state..."
                className="bg-background border-border h-10 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Code Snippet</Label>
            <CodeEditor
              value={code}
              onChange={(v) => setCode(v || "")}
              language={language}
              height="250px"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Explanation</Label>
            <RichTextEditor
              value={explanation}
              onChange={setExplanation}
              className="min-h-[150px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="bg-primary text-primary-foreground">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
