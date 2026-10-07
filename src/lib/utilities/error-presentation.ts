export type ErrorKind =
  | 'bad-request'
  | 'forbidden'
  | 'not-found'
  | 'rate-limited'
  | 'not-implemented'
  | 'unavailable'
  | 'server'
  | 'unknown';

const STATUS_KINDS: Record<number, ErrorKind> = {
  400: 'bad-request',
  403: 'forbidden',
  404: 'not-found',
  429: 'rate-limited',
  501: 'not-implemented',
  502: 'unavailable',
  503: 'unavailable',
  504: 'unavailable',
};

export const getErrorKind = (status?: number): ErrorKind => {
  if (!status) return 'unknown';
  return STATUS_KINDS[status] ?? (status >= 500 ? 'server' : 'unknown');
};
