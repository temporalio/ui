import type { DataConverter } from '@temporalio/common';

let dataConverter: DataConverter;

export function getDataConverter(): DataConverter {
  if (!dataConverter) {
    dataConverter = createDataConverter();
  }

  return dataConverter;
}

function createDataConverter(): DataConverter {
  return {
    payloadCodecs: [],
  };
}
