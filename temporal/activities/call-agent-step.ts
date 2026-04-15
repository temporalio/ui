import callLLM from './call-llm';
import callLLMClaude from './call-llm-claude';
import callLLMGemini from './call-llm-gemini';

type AgentStepInput = {
  role: string;
  prompt: string;
  context?: Record<string, unknown>;
};

const models: Record<
  string,
  (prompt: string) => Promise<Record<string, unknown>>
> = {
  'gpt-4o': callLLM,
  'claude-3-5-sonnet': callLLMClaude,
  'gemini-1.5-pro': callLLMGemini,
};

export default async function callAgentStep(
  input: AgentStepInput,
): Promise<Record<string, unknown>> {
  const fn = models[input.context?.model as string] ?? callLLM;
  return fn(input.prompt);
}
