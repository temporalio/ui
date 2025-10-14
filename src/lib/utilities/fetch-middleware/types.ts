export type FetchFunction = (request: Request) => Promise<Response>;

export type Interceptor = (next: FetchFunction) => FetchFunction;

export type RequestInterceptor = (
  request: Request,
) => Request | Promise<Request>;

export type ResponseInterceptor = (
  response: Response,
) => Response | Promise<Response>;

export interface ProxiedRequest extends Request {
  readonly [Symbol.toStringTag]: 'Request';
}

export interface ProxiedResponse extends Response {
  readonly [Symbol.toStringTag]: 'Response';
}

export interface ProxiedHeaders extends Headers {
  readonly [Symbol.toStringTag]: 'Headers';
}
