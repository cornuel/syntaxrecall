"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { 
    Bold, 
    Italic, 
    Underline as UnderlineIcon, 
    List, 
    ListOrdered, 
    Code,
    Link as LinkIcon
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    // Force re-render when selection changes to update button states
    const [, setUpdate] = useState(0);
    
    useEffect(() => {
        if (!editor) return;
        const handler = () => setUpdate(s => s + 1);
        editor.on("selectionUpdate", handler);
        editor.on("transaction", handler);
        return () => {
            editor.off("selectionUpdate", handler);
            editor.off("transaction", handler);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 p-1 mb-2 border-b border-border bg-muted/30 rounded-t-lg">
            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
                <UnderlineIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("code")}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
                <Code className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("link")}
                onPressedChange={() => {
                    const url = window.prompt("Enter URL");
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
                <LinkIcon className="h-4 w-4" />
            </Toggle>
        </div>
    );
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline cursor-pointer",
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-foreground",
                    "prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded"
                ),
            },
        },
    });

    return (
        <div className={cn("rounded-lg border border-border bg-background flex flex-col", className)}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
