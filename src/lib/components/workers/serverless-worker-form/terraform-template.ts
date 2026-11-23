/**
 * Filling a provider's Terraform snippet with what the form knows.
 *
 * Its own module so a provider's field components can use it without importing
 * shared.ts, which reads the compute provider registry at module load -- and
 * the registry imports those components.
 */
interface TerraformTemplateValues {
  externalId?: string;
  lambdaArn?: string;
  /** The Runtime Endpoint ARN, for the AgentCore module's list. */
  agentCoreEndpointArn?: string;
}

/** Rewrites a `key = [...]` list in an HCL snippet with the ARNs given. */
const replaceArnList = (template: string, key: string, value?: string) => {
  const arns = (value ?? '')
    .split(',')
    .map((arn) => arn.trim())
    .filter(Boolean);

  if (!arns.length) return template;

  const entries = arns.map((arn) => `    "${arn}",`).join('\n');

  return template.replace(
    new RegExp(`(${key}\\s*=\\s*\\[)[^\\]]*(\\])`),
    (_, open: string, close: string) => `${open}\n${entries}\n  ${close}`,
  );
};

export const interpolateTerraformTemplate = (
  template: string,
  { externalId, lambdaArn, agentCoreEndpointArn }: TerraformTemplateValues,
): string => {
  let result = template;

  if (externalId) {
    result = result.replace(
      /(external_id\s*=\s*)"[^"]*"/,
      (_, assignment: string) => `${assignment}"${externalId}"`,
    );
  }

  // Only one of these keys exists in a given snippet, so both run and the
  // absent one is a no-op rather than the caller having to say which provider
  // this template belongs to.
  result = replaceArnList(result, 'lambda_function_arns', lambdaArn);
  result = replaceArnList(result, 'agent_runtime_arns', agentCoreEndpointArn);

  return result;
};
