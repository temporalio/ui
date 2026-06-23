import { currentSpan } from 'braintrust';

import { setCompletionDetails } from '../completion-details';

async function getTraceUrl(): Promise<string | undefined> {
  try {
    return await currentSpan().permalink();
  } catch {
    return undefined;
  }
}

let attemptCount = 0;

export default async function callLLMFlaky(prompt: string): Promise<string> {
  attemptCount++;
  if (attemptCount % 2 === 1) {
    throw new Error('Rate limited by LLM provider - retrying');
  }

  const result = `After retry, here is the response to: "${prompt}"\n\nThe model was temporarily rate limited but recovered on the second attempt. This is a common pattern with LLM APIs under load.`;

  const traceUrl = await getTraceUrl();

  setCompletionDetails({
    llm: {
      model: 'gpt-4o',
      agentType: 'validator',
      promptTokens: 85,
      completionTokens: 120,
      totalTokens: 205,
      cost: 0.005,
      ...(traceUrl && { traceUrl }),
    },
  });

  return result;
}
