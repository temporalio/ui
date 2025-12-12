import { createRequestProxy, createResponseProxy } from './proxies.js';
import type { FetchFunction, Interceptor } from './types.js';

export function composeFetchMiddleware(
  interceptors: Interceptor[],
): FetchFunction {
  if (interceptors.length === 0) {
    return fetch;
  }

  return interceptors.reduceRight<FetchFunction>(
    (next, interceptor) => interceptor(next),
    createBaseFetch(),
  );
}

function createBaseFetch(): FetchFunction {
  return async (request: Request): Promise<Response> => {
    const response = await fetch(request);
    return createResponseProxy(response);
  };
}

export function createInterceptor(
  interceptorFn: (next: FetchFunction) => FetchFunction,
): Interceptor {
  return (next: FetchFunction): FetchFunction => {
    return async (request: Request): Promise<Response> => {
      const proxiedRequest = createRequestProxy(request);
      return interceptorFn(next)(proxiedRequest);
    };
  };
}
