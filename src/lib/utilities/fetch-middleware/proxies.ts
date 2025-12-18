import type {
  ProxiedHeaders,
  ProxiedRequest,
  ProxiedResponse,
} from './types.js';

export function createRequestProxy(originalRequest: Request): ProxiedRequest {
  const clonedHeaders = createHeadersProxy(originalRequest.headers);

  return new Proxy(originalRequest, {
    get(target, prop, _receiver) {
      if (prop === 'headers') {
        return clonedHeaders;
      }

      const value = Reflect.get(target, prop, target);

      if (typeof value === 'function') {
        return value.bind(target);
      }

      return value;
    },

    set(target, prop, value) {
      if (prop === 'headers') {
        return false;
      }
      return Reflect.set(target, prop, value);
    },
  }) as ProxiedRequest;
}

export function createResponseProxy(
  originalResponse: Response,
): ProxiedResponse {
  const clonedHeaders = createHeadersProxy(originalResponse.headers);

  return new Proxy(originalResponse, {
    get(target, prop, _receiver) {
      if (prop === 'headers') {
        return clonedHeaders;
      }

      const value = Reflect.get(target, prop, target);

      if (typeof value === 'function') {
        return value.bind(target);
      }

      return value;
    },

    set(target, prop, value) {
      if (prop === 'headers') {
        return false;
      }
      return Reflect.set(target, prop, value);
    },
  }) as ProxiedResponse;
}

export function createHeadersProxy(originalHeaders: Headers): ProxiedHeaders {
  const headersMap = new Map<string, string>();

  originalHeaders.forEach((value, key) => {
    headersMap.set(key.toLowerCase(), value);
  });

  const headersProxy = new Proxy(originalHeaders, {
    get(target, prop, receiver) {
      if (prop === 'get') {
        return (name: string) => headersMap.get(name.toLowerCase()) ?? null;
      }

      if (prop === 'set') {
        return (name: string, value: string) => {
          headersMap.set(name.toLowerCase(), value);
          return undefined;
        };
      }

      if (prop === 'append') {
        return (name: string, value: string) => {
          const key = name.toLowerCase();
          const existing = headersMap.get(key);
          headersMap.set(key, existing ? `${existing}, ${value}` : value);
          return undefined;
        };
      }

      if (prop === 'delete') {
        return (name: string) => {
          headersMap.delete(name.toLowerCase());
          return undefined;
        };
      }

      if (prop === 'has') {
        return (name: string) => headersMap.has(name.toLowerCase());
      }

      if (prop === 'forEach') {
        return (
          callback: (value: string, key: string, headers: Headers) => void,
        ) => {
          headersMap.forEach((value, key) => {
            callback(value, key, headersProxy as Headers);
          });
        };
      }

      if (prop === 'entries') {
        return () => headersMap.entries();
      }

      if (prop === 'keys') {
        return () => headersMap.keys();
      }

      if (prop === 'values') {
        return () => headersMap.values();
      }

      if (prop === Symbol.iterator) {
        return () => headersMap.entries();
      }

      const value = Reflect.get(target, prop, receiver);

      if (typeof value === 'function') {
        return value.bind(target);
      }

      return value;
    },
  });

  return headersProxy as ProxiedHeaders;
}
