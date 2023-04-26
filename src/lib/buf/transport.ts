import { createConnectTransport } from '@bufbuild/connect-web';
import type { Interceptor } from '@bufbuild/connect';

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
  // const accessToken = await asyncOnAuth();
  // req.header.append('Authorization', `Bearer ${accessToken}`);

  return await next(req);
};

// export const supportGrpcTransport = createGrpcWebTransport({
//   baseUrl: AppConfig.gRPC.ocld,
//   interceptors: [logger, Authenticator],
// });

// export const grpcTransport = createGrpcWebTransport({
//   baseUrl: AppConfig.gRPC.hostname,
//   interceptors: [logger, Authenticator],
// });

// export const webTransport = createGrpcWebTransport({
//   baseUrl: 'http://localhost:7233/',
//   interceptors: [logger]
// });

export const uiServerTransport = createConnectTransport({
  // Requests will be made to <baseUrl>/<package>.<service>/method
  baseUrl: 'http://localhost:7233',

  // By default, this transport uses the JSON format.
  // Set this option to true to use the binary format.
  useBinaryFormat: false,

  // Controls what the fetch client will do with credentials, such as
  // Cookies. The default value is "same-origin", which will not
  // transmit Cookies in cross-origin requests.
  credentials: 'same-origin',

  // Interceptors apply to all calls running through this transport.
  interceptors: [logger, Authenticator],
});

// export function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
//   return array.buffer.slice(
//     array.byteOffset,
//     array.byteLength + array.byteOffset,
//   );
// }
