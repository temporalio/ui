import type { DataConverter } from '@temporalio/common';

import { EncryptionCodec } from './encryption-codec';

let dataConverter: DataConverter;

export async function getDataConverter(): Promise<DataConverter> {
  if (!dataConverter) {
    dataConverter = await createDataConverter();
  }
  return dataConverter;
}

async function createDataConverter(): Promise<DataConverter> {
  return {
    payloadCodecs: [await EncryptionCodec.create('test-key-id')],
  };
}
