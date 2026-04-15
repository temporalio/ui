let attemptCount = 0;

export default async function callLLMFlaky(
  prompt: string,
): Promise<Record<string, unknown>> {
  attemptCount++;
  if (attemptCount % 2 === 1) {
    throw new Error('Rate limited by LLM provider - retrying');
  }
  return {
    result: `After retry, here is the response to: "${prompt}"\n\nThe model was temporarily rate limited but recovered on the second attempt. This is a common pattern with LLM APIs under load.`,
    _details: {
      model: 'gpt-4o',
      promptTokens: 85,
      completionTokens: 120,
      totalTokens: 205,
      cost: 0.005,
      retryReason: 'rate_limit_429',
    },
  };
}
