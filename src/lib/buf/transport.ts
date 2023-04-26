import { asyncOnAuth } from '$lib/stores/auth-store';
import { AppConfig } from '$lib/stores/app-config';
import { createGrpcWebTransport } from '@bufbuild/connect-web';
import type { Interceptor } from '@bufbuild/connect';
import {
  decodeOcldArrayResponse,
  decodeOcldResponse,
} from '$lib/utilities/decode-response';
import type { NetworkMessage } from './util/debuggerTypes';
// import type { NetworkMessage } from './util/debuggerTypes';

const logger: Interceptor = (next) => async (req) => {
  try {
    return await next(req);
  } catch (e) {
    // Don't report network errors to Sentry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e as any).report = false;

    throw e;
  }
};

const Authenticator: Interceptor = (next) => async (req) => {
  const accessToken = await asyncOnAuth();
  req.header.append('Authorization', `Bearer ${accessToken}`);

  return await next(req);
};

export const supportGrpcTransport = createGrpcWebTransport({
  baseUrl: AppConfig.gRPC.ocld,
  interceptors: [logger, Authenticator],
});

export const grpcTransport = createGrpcWebTransport({
  baseUrl: AppConfig.gRPC.hostname,
  interceptors: [logger, Authenticator],
});

export function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
  return array.buffer.slice(
    array.byteOffset,
    array.byteLength + array.byteOffset,
  );
}
