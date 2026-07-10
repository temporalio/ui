import { describe, expect, it } from 'vitest';

import { editVersionSchema } from './shared';

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
