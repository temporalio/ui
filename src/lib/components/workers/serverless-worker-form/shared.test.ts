import { describe, expect, it } from 'vitest';

import { editVersionSchema, getInitialComputeProvider } from './shared';

const validLambdaArn =
  'arn:aws:lambda:us-east-1:123456789012:function:my-function';
const validIamRoleArn = 'arn:aws:iam::123456789012:role/my-role';

const baseLambdaData = {
  provider: 'lambda' as const,
  lambdaArn: validLambdaArn,
  iamRoleArn: validIamRoleArn,
  roleExternalId: 'external-id',
};

const lambdaArnErrors = (lambdaArn: string): string[] => {
  const result = editVersionSchema.safeParse({ ...baseLambdaData, lambdaArn });
  if (result.success) return [];
  return result.error.issues
    .filter((issue) => issue.path[0] === 'lambdaArn')
    .map((issue) => issue.message);
};

describe('editVersionSchema lambda ARN validation', () => {
  it('accepts a valid unqualified Lambda ARN', () => {
    expect(lambdaArnErrors(validLambdaArn)).toEqual([]);
  });

  it('accepts a Lambda ARN pinned to a numeric version', () => {
    expect(lambdaArnErrors(`${validLambdaArn}:1`)).toEqual([]);
  });

  it('accepts a Lambda ARN referencing an alias', () => {
    expect(lambdaArnErrors(`${validLambdaArn}:PROD`)).toEqual([]);
  });

  it('rejects a Lambda ARN with a $LATEST qualifier', () => {
    expect(lambdaArnErrors(`${validLambdaArn}:$LATEST`)).toEqual([
      'Lambda ARN must reference a published version or alias, not $LATEST',
    ]);
  });

  it('rejects a malformed Lambda ARN', () => {
    expect(lambdaArnErrors('not-an-arn')).toEqual([
      'Invalid Lambda ARN format',
    ]);
  });

  it('requires a Lambda ARN', () => {
    expect(lambdaArnErrors('')).toEqual(['Lambda ARN is required']);
  });
});

describe('getInitialComputeProvider', () => {
  it('defaults to Lambda when provider configuration is omitted', () => {
    expect(getInitialComputeProvider()).toBe('lambda');
  });

  it('uses the first visible enabled configured provider', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('cloud-run');
  });

  it('ignores hidden providers', () => {
    expect(
      getInitialComputeProvider({
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('falls back to Lambda when no configured provider is selectable', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run', hidden: true },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing visible provider when it is disabled', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing provider when provider configuration is omitted', () => {
    expect(getInitialComputeProvider({ provider: 'cloud-run' })).toBe(
      'cloud-run',
    );
  });

  it('uses the first visible enabled provider when the existing provider is hidden', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('uses the first visible enabled provider when the existing provider is absent', () => {
    expect(
      getInitialComputeProvider({
        provider: 'cloud-run',
        providers: [{ value: 'lambda' }],
      }),
    ).toBe('lambda');
  });
});
