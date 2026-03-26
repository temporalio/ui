export default async function callLLMGemini(
  prompt: string,
): Promise<Record<string, unknown>> {
  return {
    result: `Gemini response to: ${prompt}`,
    _llm: {
      model: 'gemini-1.5-pro',
      promptTokens: 75,
      completionTokens: 45,
      totalTokens: 120,
      cost: 0.003,
    },
  };
}
