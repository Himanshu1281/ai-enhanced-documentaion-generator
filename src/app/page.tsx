'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { OptionsForm } from '@/components/OptionsForm';
import { Uploader, type SourceFile } from '@/components/Uploader';
import { OutputViewer } from '@/components/OutputViewer';

type GeneratePayload = {
  sources: { filename: string; content: string }[];
  goal: string;
  style: 'reference' | 'tutorial' | 'changelog';
  language: string;
};

export default function Page() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [sources, setSources] = useState<SourceFile[]>([]);

  const handleGenerate = useCallback(async (payload: GeneratePayload) => {
    setIsGenerating(true);
    setError(null);
    setOutput('');

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok || !response.body) {
        const msg = await response.text();
        throw new Error(msg || 'Failed to generate');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let flushing = false;

      const flush = () => {
        if (!buffer) return;
        setOutput(prev => prev + buffer);
        buffer = '';
        flushing = false;
      };

      const scheduleFlush = () => {
        if (flushing) return;
        flushing = true;
        setTimeout(flush, 50); // throttle UI updates ~20fps
      };

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          scheduleFlush();
        }
      }
      flush();
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const initialGoal = useMemo(
    () => 'Generate clear API reference with examples and parameter tables.',
    []
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="flex flex-col gap-4">
        <Uploader files={sources} onChange={setSources} />
        <OptionsForm
          defaultGoal={initialGoal}
          sources={sources}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          onAbort={handleAbort}
        />
      </section>
      <section className="min-h-[320px]">
        <OutputViewer content={error ? `Error: ${error}` : output} isLoading={isGenerating} />
      </section>
    </div>
  );
}

