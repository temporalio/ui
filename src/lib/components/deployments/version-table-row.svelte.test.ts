import { describe, expect, test, vi } from 'vitest';

import { runConnectionValidation } from './version-table-row.svelte';

describe('runConnectionValidation', () => {
  test('notifies after a successful validation result', async () => {
    const onValidationComplete = vi.fn();

    await runConnectionValidation(
      async () => ({ valid: true }),
      onValidationComplete,
    );

    expect(onValidationComplete).toHaveBeenCalledOnce();
  });

  test('notifies after a handled provider validation failure', async () => {
    const onValidationComplete = vi.fn();

    const { providerError } = await runConnectionValidation(async (onError) => {
      const error = {
        status: 400,
        statusText: 'Bad Request',
        body: { code: 3, message: 'Invalid connection', details: [] },
      };
      onError(error);
      return { valid: false };
    }, onValidationComplete);

    expect(providerError?.body.message).toBe('Invalid connection');
    expect(onValidationComplete).toHaveBeenCalledOnce();
  });

  test('does not notify when validation throws before handling a result', async () => {
    const onValidationComplete = vi.fn();

    await expect(
      runConnectionValidation(async () => {
        throw new Error('Network failure');
      }, onValidationComplete),
    ).rejects.toThrow('Network failure');

    expect(onValidationComplete).not.toHaveBeenCalled();
  });
});
