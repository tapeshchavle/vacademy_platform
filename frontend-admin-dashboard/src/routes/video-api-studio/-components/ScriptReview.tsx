import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface ScriptReviewProps {
    script: string;
    prompt: string;
    onScriptChange: (text: string) => void;
    onResume: () => void;
    onDiscard: () => void;
    isResuming?: boolean;
}

export function ScriptReview({
    script,
    prompt,
    onScriptChange,
    onResume,
    onDiscard,
    isResuming,
}: ScriptReviewProps) {
    const [showPrompt, setShowPrompt] = useState(false);

    const wordCount = script
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

    return (
        <div className="mx-auto w-full max-w-3xl px-2 py-4 sm:px-4">
            <div className="rounded-xl border bg-white shadow-sm dark:bg-card">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <FileText className="size-5 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Review Script
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Edit the script below, then proceed to generate audio &amp;
                                visuals.
                            </p>
                        </div>
                    </div>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {wordCount} words
                    </span>
                </div>

                {/* Original prompt (collapsible) */}
                <button
                    className="flex w-full items-center gap-2 border-b px-5 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/30"
                    onClick={() => setShowPrompt((v) => !v)}
                >
                    {showPrompt ? (
                        <ChevronUp className="size-3.5" />
                    ) : (
                        <ChevronDown className="size-3.5" />
                    )}
                    <span className="font-medium">Original prompt</span>
                    {!showPrompt && (
                        <span className="ml-1 truncate opacity-60">{prompt}</span>
                    )}
                </button>
                {showPrompt && (
                    <div className="border-b bg-muted/20 px-5 py-3 text-sm text-foreground">
                        {prompt}
                    </div>
                )}

                {/* Editable script */}
                <div className="p-5">
                    <Textarea
                        value={script}
                        onChange={(e) => onScriptChange(e.target.value)}
                        rows={20}
                        className="resize-y font-mono text-sm leading-relaxed"
                        placeholder="Script will appear here..."
                        disabled={isResuming}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t px-5 py-4">
                    <button
                        onClick={onDiscard}
                        disabled={isResuming}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                        <RotateCcw className="size-3.5" />
                        Start Over
                    </button>
                    <Button
                        onClick={onResume}
                        disabled={isResuming || !script.trim()}
                        className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                    >
                        <Play className="size-4" />
                        {isResuming ? 'Resuming...' : 'Proceed to Video'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
