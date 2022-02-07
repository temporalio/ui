import {
  setLastDataConverterFailure,
  setLastDataConverterSuccess,
} from '$lib/stores/data-converter-config';
import type { Payload } from '$types';
import type { RemoteDataConverterInterface } from '../utilities/remote-data-converter';

export async function convertPayload(
  payload: Payload,
  dataConverter: RemoteDataConverterInterface,
): Promise<Payload> {
  if (!dataConverter.isOpened()) {
    try {
      await dataConverter.open();
    } catch (_e) {
      setLastDataConverterFailure();
    }
  }

  if (!dataConverter.isOpened()) {
    return Promise.resolve(payload);
  }

  const converterResponse: Promise<Payload> = dataConverter
    .decode(payload)
    .then((response) => {
      setLastDataConverterSuccess();

      return response;
    })
    .catch(() => {
      setLastDataConverterFailure();

      return payload;
    });

  return converterResponse;
}
