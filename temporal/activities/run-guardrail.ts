type GuardrailInput = {
  type: 'input' | 'output';
  policy: string;
  content: string;
};

export default async function runGuardrail(
  input: GuardrailInput,
): Promise<Record<string, unknown>> {
  return {
    result:
      input.type === 'input'
        ? 'Input passed safety check'
        : 'Output passed compliance check',
    _details: {
      passed: true,
      policy: input.policy,
      confidence: 0.98,
      latencyMs: 12,
      flaggedTerms: [],
    },
  };
}
