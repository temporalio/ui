import { describe, expect, it } from 'vitest';

import { fetchSettings, isCloudMatch } from './settings-service';

describe('isCloudMatch', () => {
  it('should return true for tmprl.cloud', () => {
    expect(isCloudMatch.test('tmprl.cloud')).toBe(true);
  });

  it('should return true for tmprl-test.cloud', () => {
    expect(isCloudMatch.test('tmprl.cloud')).toBe(true);
  });

  it('should return false for non Temporal domains', () => {
    expect(isCloudMatch.test(undefined as unknown as string)).toBe(false);
    expect(isCloudMatch.test('xxx.xxx')).toBe(false);
    expect(isCloudMatch.test('localhost:3000')).toBe(false);
  });
});

describe('fetchSettings', () => {
  it('should map redirectToProvider auth settings', async () => {
    const request = async () =>
      new Response(
        JSON.stringify({
          Auth: {
            Enabled: true,
            Options: ['audience'],
            RedirectToProvider: true,
          },
          Codec: {},
        }),
      );

    const settings = await fetchSettings(request as typeof fetch);

    expect(settings.auth).toEqual({
      enabled: true,
      options: ['audience'],
      redirectToProvider: true,
    });
  });

  it('should default redirectToProvider to false', async () => {
    const request = async () =>
      new Response(
        JSON.stringify({
          Auth: {
            Enabled: true,
            Options: null,
          },
          Codec: {},
        }),
      );

    const settings = await fetchSettings(request as typeof fetch);

    expect(settings.auth.redirectToProvider).toBe(false);
  });
});
