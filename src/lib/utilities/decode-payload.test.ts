import { describe, expect, it } from 'vitest';

import {
  getPotentialPayloads,
  decodePayload,
  decodePayloadAttributes,
  convertPayloadToJsonWithWebsocket,
  convertPayloadToJsonWithCodec,
} from './decode-payload';
import { getEventAttributes } from '../../lib/models/event-history';
import { createWebsocket } from './data-converter-websocket';
import {
  noRemoteDataConverterWorkflowStartedEvent,
  dataConvertedFailureWorkflowStartedEvent,
  dataConvertedWorkflowStartedEvent,
  workflowStartedEvent,
  workflowStartedHistoryEvent,
} from './decode-payload-test-fixtures';
import WS from 'jest-websocket-mock';
import {
  dataConverterPort,
  lastDataConverterStatus,
  resetLastDataConverterSuccess,
} from '../stores/data-converter-config';
import {
  dataEncoderEndpoint,
  lastDataEncoderStatus,
  resetLastDataEncoderSuccess,
} from '../stores/data-encoder-config';

import { get } from 'svelte/store';
import { vi } from 'vitest';

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

describe('getPotentialPayloads', () => {
  it('Should get value of data field', () => {
    const test = {
      data: {
        payloads: Base64Decoded,
      },
    };
    expect(getPotentialPayloads(test)).toEqual(Base64Decoded);
  });

  it('Should get value of input field', () => {
    const test = {
      input: {
        payloads: WebDecodePayload,
      },
    };
    expect(getPotentialPayloads(test)).toEqual(WebDecodePayload);
  });

  it('Should get value of result field', () => {
    const test = {
      result: {
        payloads: JsonPlainEncoded,
      },
    };
    expect(getPotentialPayloads(test)).toEqual(JsonPlainEncoded);
  });

  it('Should get value of nested details field', () => {
    const test = {
      details: {
        data: {
          payloads: WebDecodePayload,
        },
      },
    };
    expect(getPotentialPayloads(test)).toEqual(WebDecodePayload);
  });

  it('Should get value of flat details field', () => {
    const test = {
      details: {
        payloads: WebDecodePayload,
      },
    };
    expect(getPotentialPayloads(test)).toEqual(WebDecodePayload);
  });
});

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

  it('Should decode a payload with encoding json/protobuf', () => {
    expect(decodePayload(ProtobufEncoded)).toEqual(Base64Decoded);
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
        const dataz = JSON.parse(data as any);

        ws.send(
          JSON.stringify({
            requestId: dataz.requestId,
            content: { Transformer: 'OptimusPrime' },
          }),
        );
      } catch (e) {
        // ignore errors, test should fail if we don't respond
      }
    });

    const websocket = createWebsocket('1337');
    await ws.connected;

    const convertedPayload = await convertPayloadToJsonWithWebsocket(
      JSON.parse(JSON.stringify(workflowStartedEvent)),
      websocket,
    );
    const decodedPayload = decodePayloadAttributes(convertedPayload);
    convertPayloadToJsonWithWebsocket(
      JSON.parse(JSON.stringify(workflowStartedEvent)),
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
      JSON.parse(JSON.stringify(workflowStartedEvent)),
      websocket,
    );
    const decodedPayload = decodePayloadAttributes(convertedPayload);

    expect(decodedPayload).toEqual(dataConvertedFailureWorkflowStartedEvent);

    const dataConverterStatus = get(lastDataConverterStatus);
    expect(dataConverterStatus).toEqual('error');
  });

  it('Should skip converting a payload and set the status to notRequested when the websocket and port is not set', async () => {
    const convertedPayload = await convertPayloadToJsonWithWebsocket(
      JSON.parse(JSON.stringify(workflowStartedEvent)),
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
        json: () => Promise.resolve({ payloads: [JsonObjectEncoded] }),
      };
    });

    const endpoint = 'http://localhost:1337';
    const convertedPayload = await convertPayloadToJsonWithCodec({
      attributes: JSON.parse(JSON.stringify(workflowStartedEvent)),
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
      attributes: JSON.parse(JSON.stringify(workflowStartedEvent)),
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
      attributes: JSON.parse(JSON.stringify(workflowStartedEvent)),
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
    resetLastDataConverterSuccess();
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
      historyEvent: JSON.parse(JSON.stringify(workflowStartedHistoryEvent)),
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
    dataConverterPort.set('3889');

    const decodedPayload = await getEventAttributes({
      historyEvent: JSON.parse(JSON.stringify(workflowStartedHistoryEvent)),
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
