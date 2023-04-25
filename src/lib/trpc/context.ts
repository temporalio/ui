import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

export async function createContext(event: RequestEvent) {
  const temporalServiceAddress = 'http://localhost:7233';
  return {
    temporalServiceAddress,
    ...event,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
