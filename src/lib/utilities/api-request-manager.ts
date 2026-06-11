import type { NetworkError } from '$lib/types/global';

import { has } from './has';
import { isObject, isString } from './is';
import { isNetworkError } from './is-network-error';

export type TemporalAPIError = {
  code: number;
  message: string;
  details: unknown[];
};

export type APIErrorBody = Partial<TemporalAPIError> & {
  message?: string;
  error?: unknown;
  [key: string]: unknown;
};

export type APIErrorResponse = {
  status: number;
  statusText: string;
  statusCode?: number;
  body: APIErrorBody;
  response?: Response;
  message?: string;
};

export type ErrorCallback = (error: APIErrorResponse) => void;

export type RequestErrorHandler = (error: unknown) => void;

export class APIRequestError extends Error implements NetworkError {
  statusCode: number;
  statusText: string;
  response: Response;
  body: APIErrorBody;

  constructor(response: Response, body: unknown) {
    const normalizedBody = toAPIErrorBody(body);
    super(errorMessage(response, normalizedBody));
    this.name = 'APIRequestError';
    this.statusCode = response.status;
    this.statusText = response.statusText;
    this.response = response;
    this.body = normalizedBody;
  }
}

export const isAPIRequestError = (error: unknown): error is APIRequestError => {
  return error instanceof APIRequestError;
};

export const isAuthenticationError = (error: unknown): boolean => {
  return hasStatusCode(error, 401) || hasStatusCode(error, 403);
};

export const parseResponseBody = async (
  response: Response,
): Promise<unknown> => {
  if (typeof response.text === 'function') {
    const text = await response.text();
    if (!text) return undefined;

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  if (typeof response.json === 'function') {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  return undefined;
};

export const toAPIErrorResponse = (
  response: Response,
  body: unknown,
): APIErrorResponse => {
  return {
    status: response.status,
    statusText: response.statusText,
    body: toAPIErrorBody(body),
  };
};

export const toAPIRequestError = (
  response: Response,
  body: unknown,
): APIRequestError => {
  return new APIRequestError(response, body);
};

export const handleCaughtRequestError = (
  error: unknown,
  options: {
    notifyOnError: boolean;
    handleError: RequestErrorHandler;
  },
): never | void => {
  if (!options.notifyOnError) {
    throw error;
  }

  if (isAuthenticationError(error)) {
    throw error;
  }

  options.handleError(error);
};

export const normalizeHeaders = (
  headers: HeadersInit | undefined,
): Record<string, string> => {
  const normalized: Record<string, string> = {};

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key] = value;
    });
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      normalized[key] = value;
    }
  } else if (headers) {
    Object.assign(normalized, headers);
  }

  normalized['Caller-Type'] = 'operator';
  return normalized;
};

const toAPIErrorBody = (body: unknown): APIErrorBody => {
  if (isObject(body)) return body as APIErrorBody;
  if (isString(body)) return { message: body };
  return {};
};

const errorMessage = (response: Response, body: APIErrorBody): string => {
  if (isString(body.message)) return body.message;
  if (isString(body.error)) return body.error;
  return response.statusText;
};

const hasStatusCode = (
  error: unknown,
  statusCode: number | string,
): boolean => {
  if (has(error, 'statusCode')) {
    return error.statusCode === statusCode;
  }

  if (has(error, 'status')) {
    return error.status === statusCode;
  }

  if (isNetworkError(error)) {
    return error.statusCode === statusCode;
  }

  return false;
};
