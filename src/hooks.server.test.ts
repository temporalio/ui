import type { RequestEvent } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';

import { handle } from './hooks.server';

describe('hooks.server', () => {
  describe('handle', () => {
    const createMockEvent = (pathname: string): RequestEvent => {
      return {
        url: new URL(`http://localhost${pathname}`),
      } as RequestEvent;
    };

    const createMockResolve = (headers?: Record<string, string>) => {
      const responseHeaders = new Headers(headers);
      return vi.fn().mockResolvedValue(
        new Response('test', {
          headers: responseHeaders,
        }),
      );
    };

    it('should set Cache-Control header for /_app/immutable/ paths', async () => {
      const event = createMockEvent('/_app/immutable/chunks/index.js');
      const resolve = createMockResolve();

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=31536000, immutable',
      );
    });

    it('should set Cache-Control header for nested /_app/immutable/ paths', async () => {
      const event = createMockEvent('/_app/immutable/assets/styles.css');
      const resolve = createMockResolve();

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=31536000, immutable',
      );
    });

    it('should set Cache-Control header for /_app/immutable/nodes/ paths', async () => {
      const event = createMockEvent('/_app/immutable/nodes/0.abc123.js');
      const resolve = createMockResolve();

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=31536000, immutable',
      );
    });

    it('should set Cache-Control header for /_app/immutable/entry/ paths', async () => {
      const event = createMockEvent('/_app/immutable/entry/app.abc123.js');
      const resolve = createMockResolve();

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=31536000, immutable',
      );
    });

    it('should not set Cache-Control header for non-immutable /_app/ paths', async () => {
      const event = createMockEvent('/_app/version.json');
      const resolve = createMockResolve();

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBeNull();
    });

    it('should not set Cache-Control header for regular routes', async () => {
      const event = createMockEvent('/namespaces/default/workflows');
      const resolve = createMockResolve();

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBeNull();
    });

    it('should not set Cache-Control header for root path', async () => {
      const event = createMockEvent('/');
      const resolve = createMockResolve();

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBeNull();
    });

    it('should not override existing Cache-Control headers for non-immutable paths', async () => {
      const event = createMockEvent('/api/some-endpoint');
      const resolve = createMockResolve({
        'Cache-Control': 'no-cache',
      });

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should preserve other headers while setting Cache-Control', async () => {
      const event = createMockEvent('/_app/immutable/chunks/index.js');
      const resolve = createMockResolve({
        'Content-Type': 'application/javascript',
        'X-Custom-Header': 'test-value',
      });

      const response = await handle({ event, resolve });

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=31536000, immutable',
      );
      expect(response.headers.get('Content-Type')).toBe(
        'application/javascript',
      );
      expect(response.headers.get('X-Custom-Header')).toBe('test-value');
    });
  });
});
