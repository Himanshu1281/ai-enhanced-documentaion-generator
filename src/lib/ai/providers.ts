import OpenAI from 'openai';

export type ProviderConfig = {
  provider: 'openai' | 'azure';
  apiKey: string;
  baseURL?: string;
  model: string;
};

export function getProviderConfig(): ProviderConfig {
  const provider = (process.env.AI_PROVIDER || 'openai') as 'openai' | 'azure';
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.AZURE_OPENAI_API_KEY ||
    '';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const baseURL =
    provider === 'azure'
      ? process.env.AZURE_OPENAI_BASE_URL
      : process.env.OPENAI_BASE_URL;

  if (!apiKey) throw new Error('Missing AI API key');

  return { provider, apiKey, baseURL, model };
}

export function getOpenAIClient() {
  const cfg = getProviderConfig();
  return new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
}

