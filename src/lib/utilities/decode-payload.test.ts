import { describe, expect, it, afterEach } from 'vitest';

import {
  decodePayload,
  decodePayloadAttributes,
  convertPayloadToJsonWithCodec,
} from './decode-payload';
import { getEventAttributes } from '../../lib/models/event-history';
import {
  noRemoteDataConverterWorkflowStartedEvent,
  dataConvertedWorkflowStartedEvent,
  workflowStartedEvent,
  workflowStartedHistoryEvent,
} from './decode-payload-test-fixtures';
import {
  dataEncoderEndpoint,
  lastDataEncoderStatus,
  resetLastDataEncoderSuccess,
} from '../stores/data-encoder-config';

import { get } from 'svelte/store';
import { vi } from 'vitest';
import { parseWithBigInt, stringifyWithBigInt } from './parse-with-big-int';

const WebDecodePayload = {
  metadata: {
    encoding: 'YmluYXJ5L2VuY3J5cHRlZA==',
    'encryption-key-id': '',
  },
  data: 'dlSjfJltMHoITwMRv4gqQZsf3yXLo5UVtroA7ZXM3Eeggnrkzc+h6+xhQm2TQ6z8rska0QtWu7Ye3AhYfGw+8mY6/5NN+La4TJmKOe5/EKfL2znMbIXBzXLaeK4MjjIrxo2gI1weYHBb',
};

const JsonPlainEncoded = {
  metadata: {
    encoding: 'anNvbi9wbGFpbg==',
    type: 'S2V5d29yZA==',
  },
  data: 'InRlc3RAdGVzdC5jb20i',
};

const JsonFooEncoded = {
  metadata: {
    encoding: 'anNvbi9mb28=',
    type: 'S2V5d29yZA==',
  },
  data: 'InRlc3RAdGVzdC5jb20i',
};

const ProtobufEncoded = {
  metadata: {
    encoding: 'anNvbi9wcm90b2J1Zg==',
    type: 'S2V5d29yZA==',
  },
  data: 'InRlc3RAdGVzdC5jb20i',
};

const BinaryNullEncodedNoData = {
  metadata: {
    encoding: 'YmluYXJ5L251bGw=',
  },
  data: null,
};

const Base64Decoded = 'test@test.com';

const JsonObjectEncoded = {
  metadata: {
    encoding: 'anNvbi9wbGFpbg==',
    type: 'S2V5d29yZA==',
  },
  data: 'eyAiVHJhbnNmb3JtZXIiOiAiT3B0aW11c1ByaW1lIiB9',
};

describe('decodePayload', () => {
  it('Should not decode a payload with encoding binary/encrypted', () => {
    expect(decodePayload(WebDecodePayload)).toEqual(WebDecodePayload);
  });

  it('Should not decode a payload with encoding binary/encrypted', () => {
    expect(decodePayload(BinaryNullEncodedNoData)).toEqual(
      BinaryNullEncodedNoData,
    );
  });

  it('Should decode a payload with encoding json/plain', () => {
    expect(decodePayload(JsonPlainEncoded)).toEqual(Base64Decoded);
  });

  it('Should decode a payload with encoding json/foo', () => {
    expect(decodePayload(JsonFooEncoded)).toEqual(Base64Decoded);
  });

  it('Should decode a payload with encoding json/protobuf', () => {
    expect(decodePayload(ProtobufEncoded)).toEqual(Base64Decoded);
  });
});

describe('convertPayloadToJsonWithCodec', () => {
  afterEach(() => {
    resetLastDataEncoderSuccess();
    vi.clearAllMocks();
  });
  it('Should convert a payload through data-converter and set the success status when the endpoint is set and the endpoint connects', async () => {
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonObjectEncoded] }),
      };
    });

    const endpoint = 'http://localhost:1337';
    const convertedPayload = await convertPayloadToJsonWithCodec({
      attributes: parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      namespace: 'default',
      settings: {
        codec: {
          endpoint,
        },
      },
    });

    const decodedPayload = decodePayloadAttributes(convertedPayload);
    expect(decodedPayload).toEqual(dataConvertedWorkflowStartedEvent);
    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('success');
  });
  it('Should fail converting a payload through data-converter and set the error status when the endpoint is set and the endpoint fails', async () => {
    // tslint:disable-next-line
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.reject(),
      };
    });

    const endpoint = 'http://localhost:1337';
    const convertedPayload = await convertPayloadToJsonWithCodec({
      attributes: parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      namespace: 'default',
      settings: {
        codec: {
          endpoint,
        },
      },
    });

    const decodedPayload = decodePayloadAttributes(convertedPayload);
    expect(decodedPayload).toEqual(noRemoteDataConverterWorkflowStartedEvent);
    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('error');
  });
  it('Should skip converting a payload and set the status to notRequested when the encoder endpoint is not set', async () => {
    const convertedPayload = await convertPayloadToJsonWithCodec({
      attributes: parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      namespace: 'default',
      settings: {
        codec: {
          endpoint: '',
        },
      },
    });
    const decodedPayload = decodePayloadAttributes(convertedPayload);
    expect(decodedPayload).toEqual(noRemoteDataConverterWorkflowStartedEvent);

    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('notRequested');
  });
});

// Integration test
describe('getEventAttributes', () => {
  afterEach(() => {
    resetLastDataEncoderSuccess();
  });
  it('Should convert a payload through data-converter and set the success status when the endpoint is set locally and the endpoint connects', async () => {
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonObjectEncoded] }),
      };
    });

    const endpoint = 'http://localhost:1337';
    dataEncoderEndpoint.set(endpoint);

    const decodedPayload = await getEventAttributes({
      historyEvent: parseWithBigInt(
        stringifyWithBigInt(workflowStartedHistoryEvent),
      ),
      namespace: 'default',
      settings: {
        codec: {
          endpoint: '',
        },
      },
    });

    expect(decodedPayload).toEqual(dataConvertedWorkflowStartedEvent);
    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('success');
  });
  it('Should convert a payload through data-converter and set the success status when both the endpoint and websocket is set and the endpoint connects', async () => {
    // tslint:disable-next-line
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonObjectEncoded] }),
      };
    });

    const endpoint = 'http://localhost:1337';
    dataEncoderEndpoint.set(endpoint);

    const decodedPayload = await getEventAttributes({
      historyEvent: parseWithBigInt(
        stringifyWithBigInt(workflowStartedHistoryEvent),
      ),
      namespace: 'default',
      settings: {
        codec: {
          endpoint: '',
        },
      },
    });

    expect(decodedPayload).toEqual(dataConvertedWorkflowStartedEvent);
    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('success');
  });
});
