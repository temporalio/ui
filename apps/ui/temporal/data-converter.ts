import type { DataConverter } from '@temporalio/common';

import { PayloadCodec } from './payload-codec';

let dataConverter: DataConverter;

export function getDataConverter(): DataConverter {
  if (!dataConverter) {
    dataConverter = createDataConverter();
  }
  return dataConverter;
}

function createDataConverter(): DataConverter {
  return {
    payloadCodecs: [new PayloadCodec()],
  };
}
