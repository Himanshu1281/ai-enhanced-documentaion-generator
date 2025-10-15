"use client";

import { useCallback, useRef, useState } from 'react';
import { clsx } from 'clsx';

export type SourceFile = { filename: string; content: string };

export function Uploader(props: { files?: SourceFile[]; onChange: (files: SourceFile[]) => void }) {
  const { files = [], onChange } = props;
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming: SourceFile[] = [];
    for (const file of Array.from(fileList).slice(0, 24)) {
      const content = await file.text();
      incoming.push({ filename: file.name, content });
    }
    const existingByName = new Set(files.map(f => f.filename));
    const merged = [...files, ...incoming.filter(f => !existingByName.has(f.filename))].slice(0, 24);
    onChange(merged);
    // Allow selecting the same file again by clearing the input value
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [files, onChange]);

  const removeAt = useCallback(
    (idx: number) => {
      const next = files.filter((_, i) => i !== idx);
      onChange(next);
    },
    [files, onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        className={clsx(
          'rounded-md border border-dashed p-6 text-sm text-neutral-600',
          drag ? 'bg-neutral-100' : 'bg-white'
        )}
        onDragOver={e => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        Drop files here or click to upload (max 24 files)
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        onChange={e => handleFiles(e.currentTarget.files)}
      />
      {files.length > 0 ? (
        <ul className="divide-y rounded-md border bg-white text-sm text-black">
          {files.map((f, idx) => (
            <li key={`${f.filename}-${idx}`} className="flex items-center justify-between px-3 py-2">
              <span className="truncate font-medium" title={f.filename}>{f.filename}</span>
              <button
                aria-label="Remove file"
                className="ml-3 rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                onClick={() => removeAt(idx)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

