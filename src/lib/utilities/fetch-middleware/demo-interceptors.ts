import type { Interceptor } from './types.js';

export const RequestResponseLogger: Interceptor = (next) => async (req) => {
  const start = Date.now();

  // Collect request headers
  const requestHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });

  // Log request details
  console.log('[BEFORE]', {
    method: req.method,
    url: req.url,
    headers: requestHeaders,
    next,
    req,
  });
  let response;
  try {
    response = await next(req);
  } catch (e) {
    console.log(e);
  }
  const duration = Date.now() - start;

  // Collect response headers
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  // Log response details
  console.log('[AFTER]', {
    status: response.status,
    statusText: response.statusText,
    duration: `${duration}ms`,
    headers: responseHeaders,
  });

  return response;
};
