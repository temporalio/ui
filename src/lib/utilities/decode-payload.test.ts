import { get } from 'svelte/store';

import WS from 'jest-websocket-mock';
import { afterEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { createWebsocket } from './data-converter-websocket';
import {
  convertPayloadToJsonWithCodec,
  convertPayloadToJsonWithWebsocket,
  decodeAllPotentialPayloadsWithCodec,
  decodeAllPotentialPayloadsWithWebsockets,
  decodePayload,
  decodePayloadAttributes,
} from './decode-payload';
import {
  dataConvertedFailureWorkflowStartedEvent,
  dataConvertedWorkflowStartedEvent,
  getTestPayloadEvent,
  getTestPayloadEventWithNullEncodedAttributes,
  noRemoteDataConverterWorkflowStartedEvent,
  workflowStartedEvent,
  workflowStartedHistoryEvent,
} from './decode-payload-test-fixtures';
import { parseWithBigInt, stringifyWithBigInt } from './parse-with-big-int';
import { getEventAttributes } from '../../lib/models/event-history';
import {
  dataConverterPort,
  lastDataConverterStatus,
  resetLastDataConverterSuccess,
} from '../stores/data-converter-config';
import {
  codecEndpoint,
  lastDataEncoderStatus,
  resetLastDataEncoderSuccess,
} from '../stores/data-encoder-config';

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

const JsonObjectEncodedWithConstructor = {
  metadata: {
    encoding: 'anNvbi9wbGFpbg==',
    type: 'S2V5d29yZA==',
  },
  data: 'eyAiQ29uc3RydWN0b3JPdXRwdXQiOiAiT3B0aW11c1ByaW1lIiB9',
};

const JsonObjectDecoded = { Transformer: 'OptimusPrime' };
const JsonObjectDecodedWithConstructor = { ConstructorOutput: 'OptimusPrime' };

describe('decodePayload', () => {
  it('Should not decode a payload with encoding binary/encrypted', () => {
    expect(decodePayload(WebDecodePayload)).toEqual(WebDecodePayload);
  });
  it('Should not decode a payload with encoding binary/null', () => {
    expect(decodePayload(BinaryNullEncodedNoData)).toEqual(null);
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
  it('Should decode a json payload with encoding json/plain', () => {
    expect(decodePayload(JsonObjectEncoded)).toEqual(JsonObjectDecoded);
  });
  it('Should decode a json payload with constructor keyword with encoding json/plain', () => {
    expect(decodePayload(JsonObjectEncodedWithConstructor)).toEqual(
      JsonObjectDecodedWithConstructor,
    );
  });
});

describe('decode all potential payloads', () => {
  it('Should decode a payload with codec endpoint with encoding json/plain`', async () => {
    const event = await decodeAllPotentialPayloadsWithCodec(
      getTestPayloadEvent(),
      'default',
      {},
      '',
    );
    expect(event.input).toEqual({ payloads: ['test@test.com'] });
    expect(event.encodedAttributes).toEqual('a test attribute');
    expect(event.details.detail1).toEqual({ payloads: [{ test: 'detail' }] });
  });
  it('Should not decode a null payload with codec endpoint with encoding json/plain`', async () => {
    const event = await decodeAllPotentialPayloadsWithCodec(
      getTestPayloadEventWithNullEncodedAttributes(),
      'default',
      {},
      '',
    );
    expect(event.input).toEqual({ payloads: ['test@test.com'] });
    expect(event.encodedAttributes).toEqual(null);
    expect(event.details.detail1).toEqual({ payloads: [{ test: 'detail' }] });
  });

  it('Should decode a payload with websockets with encoding json/plain`', async () => {
    const event = await decodeAllPotentialPayloadsWithWebsockets(
      getTestPayloadEvent(),
      {},
    );
    expect(event.input).toEqual({ payloads: ['test@test.com'] });
    expect(event.encodedAttributes).toEqual('a test attribute');
    expect(event.details.detail1).toEqual({ payloads: [{ test: 'detail' }] });
  });
});

describe('convertPayloadToJsonWithWebsocket', () => {
  afterEach(() => {
    resetLastDataConverterSuccess();
  });
  it('Should convert a payload through data-converter and set the success status when the websocket is set and the websocket connects', async () => {
    const ws = new WS('ws://localhost:1337');

    // We need to respond to the websocket messages with the requestID so the
    // websocket as promised library can resolve the promises correctly without
    // the requestId it won't properly resolve
    ws.nextMessage.then((data) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dataz = parseWithBigInt(data as any);

        ws.send(
          stringifyWithBigInt({
            requestId: dataz.requestId,
            content: 'test@test.com',
          }),
        );
      } catch (e) {
        // ignore errors, test should fail if we don't respond
      }
    });

    const websocket = createWebsocket('1337');
    await ws.connected;

    const convertedPayload = await convertPayloadToJsonWithWebsocket(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      websocket,
    );
    const decodedPayload = decodePayloadAttributes(convertedPayload);
    convertPayloadToJsonWithWebsocket(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      {},
    );
    expect(decodedPayload).toEqual(dataConvertedWorkflowStartedEvent);

    const dataConverterStatus = get(lastDataConverterStatus);
    expect(dataConverterStatus).toEqual('success');

    ws.close();
    WS.clean();
  });

  it('Should fail converting a payload through data-converter and set the status to error when the websocket is set and the websocket fails connection', async () => {
    const websocket = createWebsocket('break', {
      timeout: 1,
    });

    const convertedPayload = await convertPayloadToJsonWithWebsocket(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      websocket,
    );
    const decodedPayload = decodePayloadAttributes(convertedPayload);

    expect(decodedPayload).toEqual(dataConvertedFailureWorkflowStartedEvent);

    const dataConverterStatus = get(lastDataConverterStatus);
    expect(dataConverterStatus).toEqual('error');
  });

  it('Should skip converting a payload and set the status to notRequested when the websocket and port is not set', async () => {
    const convertedPayload = await convertPayloadToJsonWithWebsocket(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
    );
    const decodedPayload = decodePayloadAttributes(convertedPayload);

    expect(decodedPayload).toEqual(noRemoteDataConverterWorkflowStartedEvent);

    const dataConverterStatus = get(lastDataConverterStatus);
    expect(dataConverterStatus).toEqual('notRequested');
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
        json: () => Promise.resolve({ payloads: [JsonPlainEncoded] }),
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
  it('Should not include credentials with the request for cookie based authentication of data converters by default', async () => {
    const mockFetch = vi.fn(async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonPlainEncoded] }),
      };
    });

    vi.stubGlobal('fetch', mockFetch);

    const endpoint = 'http://localhost:1337';
    await convertPayloadToJsonWithCodec({
      attributes: parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      namespace: 'default',
      settings: {
        codec: {
          endpoint,
        },
      },
    });

    expect(mockFetch).toBeCalledWith(
      expect.any(String),
      expect.not.objectContaining({ credentials: 'same-origin' }),
    );
  });
  it('Should include cross-origin credentials with the request for cookie based authentication of data converters when includeCredentials is set', async () => {
    const mockFetch = vi.fn(async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonPlainEncoded] }),
      };
    });

    vi.stubGlobal('fetch', mockFetch);

    const endpoint = 'http://localhost:1337';
    await convertPayloadToJsonWithCodec({
      attributes: parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
      namespace: 'default',
      settings: {
        codec: {
          endpoint,
          includeCredentials: true,
        },
      },
    });

    expect(mockFetch).toBeCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' }),
    );
  });
});

// Integration test
describe('getEventAttributes', () => {
  afterEach(() => {
    resetLastDataEncoderSuccess();
    resetLastDataConverterSuccess();
  });
  it('Should convert a payload through data-converter and set the success status when the endpoint is set locally and the endpoint connects', async () => {
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonPlainEncoded] }),
      };
    });

    const endpoint = 'http://localhost:1337';
    codecEndpoint.set(endpoint);

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
        json: () => Promise.resolve({ payloads: [JsonPlainEncoded] }),
      };
    });

    const endpoint = 'http://localhost:1337';
    codecEndpoint.set(endpoint);
    dataConverterPort.set('3889');

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
