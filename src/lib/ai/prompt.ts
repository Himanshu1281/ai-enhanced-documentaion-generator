type Style = 'reference' | 'tutorial' | 'changelog';

export function buildSystemPrompt(style: Style) {
  const base =
    'You are an expert AI assistant. Always prioritize the user\'s stated goal. If the goal asks for documentation, write excellent technical docs. If it asks for Q&A, explanations, summaries, transformations, code examples, or any other output, produce that instead. Keep outputs concise, accurate, and consistent. Use valid Markdown unless the goal requests another format.';
  const byStyle: Record<Style, string> = {
    reference:
      'Style: API reference with sections for Overview, Endpoints/Functions, Parameters (table), Returns, Examples, and Notes.',
    tutorial:
      'Style: step-by-step tutorial with prerequisites, setup, numbered steps, and pitfalls.',
    changelog:
      'Style: semantic changelog with categories (Added, Changed, Fixed, Deprecated, Removed, Security).',
  };
  return `${base}\nNote: If the chosen style conflicts with the goal, follow the goal.\n${byStyle[style]}`;
}

export function buildUserPrompt(params: {
  goal: string;
  language: string;
  sources: { filename: string; content: string }[];
}) {
  const { goal, language, sources } = params;
  const safeSources = Array.isArray(sources) ? sources : [];
  const files = safeSources
    .map(
      f => `File: ${f.filename}\n---\n${truncate(f.content, 4000)}\n---\n`
    )
    .join('\n');
  const sourcesBlock = safeSources.length
    ? `Sources (subset):\n${files}\n`
    : 'No source files provided. Use general best practices and be explicit about assumptions.\n';
  return `Goal: ${goal}\nPrimary language/context: ${language}\n\n${sourcesBlock}Constraints: Be accurate to any provided sources. If uncertain, state assumptions.`;
}

function truncate(input: string, max: number) {
  return input.length > max ? input.slice(0, max) + '\n…[truncated]' : input;
}

