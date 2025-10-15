type Style = 'reference' | 'tutorial' | 'changelog';

export function buildSystemPrompt(style: Style) {
  const base =
    'You are an expert technical writer. Generate concise, accurate, and consistent documentation. Prefer tables for parameters and bullet points for steps. Output valid Markdown only.';
  const byStyle: Record<Style, string> = {
    reference:
      'Style: API reference with sections for Overview, Endpoints/Functions, Parameters (table), Returns, Examples, and Notes.',
    tutorial:
      'Style: step-by-step tutorial with prerequisites, setup, numbered steps, and pitfalls.',
    changelog:
      'Style: semantic changelog with categories (Added, Changed, Fixed, Deprecated, Removed, Security).',
  };
  return `${base}\n${byStyle[style]}`;
}

export function buildUserPrompt(params: {
  goal: string;
  language: string;
  sources: { filename: string; content: string }[];
}) {
  const { goal, language, sources } = params;
  const files = sources
    .map(
      f => `File: ${f.filename}\n---\n${truncate(f.content, 8000)}\n---\n`
    )
    .join('\n');
  return `Goal: ${goal}\nPrimary language/context: ${language}\n\nSources (subset):\n${files}\nConstraints: Be accurate to sources. If uncertain, state assumptions.`;
}

function truncate(input: string, max: number) {
  return input.length > max ? input.slice(0, max) + '\n…[truncated]' : input;
}

