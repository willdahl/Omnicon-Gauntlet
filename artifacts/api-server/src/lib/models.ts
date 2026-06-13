// Curated model registry for the regeneration engine.
// Model IDs are verified against the OpenRouter catalog. Pricing is fetched
// live from OpenRouter so cost estimates track real per-token rates.

export interface ModelInfo {
  id: string;
  label: string;
  provider: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "google/gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    provider: "Google",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    label: "Claude Sonnet 4.6",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-opus-4.8",
    label: "Claude Opus 4.8",
    provider: "Anthropic",
  },
  { id: "openai/gpt-5.5", label: "GPT-5.5", provider: "OpenAI" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini", provider: "OpenAI" },
];

export const DEFAULT_MODEL = "google/gemini-3.5-flash";

export function isKnownModel(id: string): boolean {
  return AVAILABLE_MODELS.some((m) => m.id === id);
}

interface PricingEntry {
  prompt: number;
  completion: number;
}

interface PricingCache {
  fetchedAt: number;
  prices: Record<string, PricingEntry>;
}

let pricingCache: PricingCache | null = null;
const PRICING_TTL_MS = 60 * 60 * 1000; // 1 hour

async function loadPricing(): Promise<Record<string, PricingEntry>> {
  if (pricingCache && Date.now() - pricingCache.fetchedAt < PRICING_TTL_MS) {
    return pricingCache.prices;
  }

  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenRouter pricing: ${res.status}`);
  }
  const json = (await res.json()) as {
    data: Array<{ id: string; pricing?: { prompt?: string; completion?: string } }>;
  };

  const prices: Record<string, PricingEntry> = {};
  for (const m of json.data) {
    const prompt = Number(m.pricing?.prompt);
    const completion = Number(m.pricing?.completion);
    if (Number.isFinite(prompt) && Number.isFinite(completion)) {
      prices[m.id] = { prompt, completion };
    }
  }
  pricingCache = { fetchedAt: Date.now(), prices };
  return prices;
}

// Returns the estimated cost in USD, or null if pricing could not be resolved.
export async function estimateCostUsd(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): Promise<number | null> {
  try {
    const prices = await loadPricing();
    const entry = prices[modelId];
    if (!entry) return null;
    return inputTokens * entry.prompt + outputTokens * entry.completion;
  } catch {
    return null;
  }
}
