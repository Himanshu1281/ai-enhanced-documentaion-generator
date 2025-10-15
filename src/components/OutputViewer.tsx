"use client";

import { useMemo } from 'react';

export function OutputViewer(props: { content: string; isLoading?: boolean }) {
  const { content, isLoading } = props;
  const display = useMemo(() => content || (isLoading ? 'Generating…' : ''), [content, isLoading]);
  return (
    <div className="prose max-w-none whitespace-pre-wrap rounded-md border bg-white p-4 text-sm text-black">
      {display}
    </div>
  );
}

