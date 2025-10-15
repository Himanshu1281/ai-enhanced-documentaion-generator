"use client";

import { useCallback, useState } from 'react';

type Style = 'reference' | 'tutorial' | 'changelog';

export function OptionsForm(props: {
  defaultGoal?: string;
  isGenerating?: boolean;
  onAbort?: () => void;
  onGenerate: (payload: {
    sources: { filename: string; content: string }[];
    goal: string;
    style: Style;
    language: string;
  }) => void;
  sources?: { filename: string; content: string }[];
}) {
  const { defaultGoal, onGenerate, isGenerating, onAbort, sources = [] } = props;
  const [goal, setGoal] = useState(defaultGoal || '');
  const [style, setStyle] = useState<Style>('reference');
  const [language, setLanguage] = useState('en');
  const [pasted, setPasted] = useState('');

  const handleGenerate = useCallback(() => {
    const combined = [
      ...sources,
      ...(pasted ? [{ filename: 'pasted.md', content: pasted }] : []),
    ];
    onGenerate({ sources: combined, goal, style, language });
  }, [onGenerate, sources, goal, style, language, pasted]);

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Goal</label>
        <textarea
          className="w-full rounded-md border p-2 text-sm"
          rows={4}
          value={goal}
          onChange={e => setGoal(e.currentTarget.value)}
          placeholder="Describe what to generate (e.g., API reference with examples)"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Style</label>
          <select
            className="w-full rounded-md border p-2 text-sm bg-black text-white"
            value={style}
            onChange={e => setStyle(e.currentTarget.value as Style)}
          >
            <option value="reference">Reference</option>
            <option value="tutorial">Tutorial</option>
            <option value="changelog">Changelog</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Language</label>
          <input
            className="w-full rounded-md border p-2 text-sm"
            value={language}
            onChange={e => setLanguage(e.currentTarget.value)}
            placeholder="e.g., en, es, fr"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Paste code (optional)</label>
        <textarea
          className="w-full rounded-md border p-2 font-mono text-xs"
          rows={8}
          value={pasted}
          onChange={e => setPasted(e.currentTarget.value)}
          placeholder="Paste code or content here if not uploading files"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={handleGenerate}
          disabled={isGenerating || !goal}
        >
          {isGenerating ? 'Generating…' : 'Generate'}
        </button>
        {isGenerating ? (
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={onAbort}
          >
            Stop
          </button>
        ) : null}
      </div>
    </div>
  );
}

