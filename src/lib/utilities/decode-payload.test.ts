import { get } from 'svelte/store';

import { afterEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import {
  decodeEventAttributes,
  parsePayload,
  parsePayloadAttributes,
} from './decode-payload';
import {
  dataConvertedWorkflowStartedEvent,
  getTestPayloadEvent,
  getTestPayloadEventWithNullEncodedAttributes,
  noRemoteDataConverterWorkflowStartedEvent,
  workflowStartedEvent,
  workflowStartedHistoryEvent,
} from './decode-payload-test-fixtures';
import { parseWithBigInt, stringifyWithBigInt } from './parse-with-big-int';
import { getEventAttributes } from '../../lib/models/event-history';
import { resetLastDataConverterSuccess } from '../stores/data-converter-config';
import {
  codecEndpoint,
  includeCredentials,
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

const ProtobufEncodedWithMessageType = {
  metadata: {
    encoding: 'anNvbi9wcm90b2J1Zg==',
    messageType:
      'dGVtcG9yYWwuYXBpLndvcmtmbG93LnYxLldvcmtmbG93RXhlY3V0aW9uU3RhcnRlZEV2ZW50QXR0cmlidXRlcw==',
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

describe('parsePayload with default returnDataOnly', () => {
  it('Should not decode a payload with encoding binary/encrypted', () => {
    expect(parsePayload(WebDecodePayload)).toEqual(WebDecodePayload);
  });
  it('Should not decode a payload with encoding binary/null', () => {
    expect(parsePayload(BinaryNullEncodedNoData)).toEqual(null);
  });
  it('Should decode a payload with encoding json/plain', () => {
    expect(parsePayload(JsonPlainEncoded)).toEqual(Base64Decoded);
  });
  it('Should decode a payload with encoding json/foo', () => {
    expect(parsePayload(JsonFooEncoded)).toEqual(Base64Decoded);
  });
  it('Should decode a payload with encoding json/protobuf', () => {
    expect(parsePayload(ProtobufEncoded)).toEqual(Base64Decoded);
  });
  it('Should decode a json payload with encoding json/plain', () => {
    expect(parsePayload(JsonObjectEncoded)).toEqual(JsonObjectDecoded);
  });
  it('Should decode a json payload with constructor keyword with encoding json/plain', () => {
    expect(parsePayload(JsonObjectEncodedWithConstructor)).toEqual(
      JsonObjectDecodedWithConstructor,
    );
  });
});

describe('parsePayload with returnDataOnly = false', () => {
  it('Should not decode a payload with encoding binary/encrypted', () => {
    expect(parsePayload(WebDecodePayload, false)).toEqual(WebDecodePayload);
  });
  it('Should not decode a payload with encoding binary/null', () => {
    const fullDecodedPayload = {
      metadata: {
        encoding: 'binary/null',
      },
      data: null,
    };
    expect(parsePayload(BinaryNullEncodedNoData, false)).toEqual(
      fullDecodedPayload,
    );
  });
  it('Should decode a payload with encoding json/plain', () => {
    const fullDecodedPayload = {
      metadata: {
        encoding: 'json/plain',
        type: 'Keyword',
      },
      data: Base64Decoded,
    };
    expect(parsePayload(JsonPlainEncoded, false)).toEqual(fullDecodedPayload);
  });
  it('Should decode a payload with encoding json/foo', () => {
    const fullDecodedPayload = {
      metadata: {
        encoding: 'json/foo',
        type: 'Keyword',
      },
      data: Base64Decoded,
    };
    expect(parsePayload(JsonFooEncoded, false)).toEqual(fullDecodedPayload);
  });
  it('Should decode a payload with encoding json/protobuf', () => {
    const fullDecodedPayload = {
      metadata: {
        encoding: 'json/protobuf',
        type: 'Keyword',
      },
      data: Base64Decoded,
    };
    expect(parsePayload(ProtobufEncoded, false)).toEqual(fullDecodedPayload);
  });
  it('Should decode a payload with encoding json/protobuf with messageType', () => {
    const fullDecodedPayload = {
      metadata: {
        encoding: 'json/protobuf',
        messageType:
          'temporal.api.workflow.v1.WorkflowExecutionStartedEventAttributes',
      },
      data: Base64Decoded,
    };
    expect(parsePayload(ProtobufEncodedWithMessageType, false)).toEqual(
      fullDecodedPayload,
    );
  });
  it('Should decode a json payload with encoding json/plain', () => {
    const fullDecodedPayload = {
      metadata: {
        encoding: 'json/plain',
        type: 'Keyword',
      },
      data: JsonObjectDecoded,
    };
    expect(parsePayload(JsonObjectEncoded, false)).toEqual(fullDecodedPayload);
  });
  it('Should decode a json payload with constructor keyword with encoding json/plain', () => {
    const fullDecodedPayload = {
      metadata: {
        encoding: 'json/plain',
        type: 'Keyword',
      },
      data: JsonObjectDecodedWithConstructor,
    };
    expect(parsePayload(JsonObjectEncodedWithConstructor, false)).toEqual(
      fullDecodedPayload,
    );
  });
});

describe('parsePayloadAttributes', () => {
  it('Should parsePayloadAttributes searchAttributes with indexedFields', () => {
    const payload = {
      searchAttributes: {
        indexedFields: {
          CandidateEmail: {
            metadata: {
              encoding: 'anNvbi9wbGFpbg==',
              type: 'S2V5d29yZA==',
            },
            data: 'IndoYWR1cEBsb2xjYXRzLmNvbSI=',
          },
        },
      },
    };
    const result = {
      searchAttributes: {
        indexedFields: { CandidateEmail: 'whadup@lolcats.com' },
      },
    };

    const decodedPayload = parsePayloadAttributes(payload);
    expect(decodedPayload).toEqual(result);
  });

  it('Should parsePayloadAttributes searchAttributes without indexedFields', () => {
    const payload = {
      searchAttributes: {
        CustomKeywordField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'InRlc3RAdGVzdC5jb20i',
        },
      },
    };
    const result = {
      searchAttributes: { CustomKeywordField: 'test@test.com' },
    };

    const decodedPayload = parsePayloadAttributes(payload);
    expect(decodedPayload).toEqual(result);
  });
});

describe('decodeEventAttributes', () => {
  afterEach(() => {
    resetLastDataEncoderSuccess();
    codecEndpoint.set(null);
    includeCredentials.set(false);
    vi.clearAllMocks();
  });

  it('Should decode a payload with codec endpoint with encoding json/plain`', async () => {
    const event = await decodeEventAttributes(getTestPayloadEvent());
    expect(event.input).toEqual({ payloads: ['test@test.com'] });
    expect(event.encodedAttributes).toEqual('a test attribute');
    expect(event.details.detail1).toEqual({ payloads: [{ test: 'detail' }] });
  });
  it('Should not decode a null payload with codec endpoint with encoding json/plain`', async () => {
    const event = await decodeEventAttributes(
      getTestPayloadEventWithNullEncodedAttributes(),
    );
    expect(event.input).toEqual({ payloads: ['test@test.com'] });
    expect(event.encodedAttributes).toEqual(null);
    expect(event.details.detail1).toEqual({ payloads: [{ test: 'detail' }] });
  });

  it('Should convert a payload through data-converter and set the success status when the endpoint is set and the endpoint connects', async () => {
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonPlainEncoded] }),
      };
    });

    codecEndpoint.set('http://localhost:1337');
    const convertedPayload = await decodeEventAttributes(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
    );

    const decodedPayload = parsePayloadAttributes(convertedPayload);
    expect(decodedPayload).toEqual(dataConvertedWorkflowStartedEvent);
    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('success');
  });
  it('Should fail converting a payload through data-converter and set the error status when the endpoint is set and the endpoint fails', async () => {
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.reject(),
      };
    });

    codecEndpoint.set('http://localhost:1337');
    const convertedPayload = await decodeEventAttributes(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
    );

    const decodedPayload = parsePayloadAttributes(convertedPayload);
    expect(decodedPayload).toEqual(noRemoteDataConverterWorkflowStartedEvent);
    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('error');
  });
  it('Should skip converting a payload and set the status to notRequested when the encoder endpoint is not set', async () => {
    const convertedPayload = await decodeEventAttributes(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
    );
    const decodedPayload = parsePayloadAttributes(convertedPayload);
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

    codecEndpoint.set('http://localhost:1337');
    await decodeEventAttributes(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
    );

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

    codecEndpoint.set('http://localhost:1337');
    includeCredentials.set(true);
    await decodeEventAttributes(
      parseWithBigInt(stringifyWithBigInt(workflowStartedEvent)),
    );

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
    codecEndpoint.set(null);
  });
  it('Should convert a payload through data-converter and set the success status when the endpoint is set locally and the endpoint connects', async () => {
    vi.stubGlobal('fetch', async () => {
      return {
        json: () => Promise.resolve({ payloads: [JsonPlainEncoded] }),
      };
    });

    codecEndpoint.set('http://localhost:1337');

    const decodedPayload = await getEventAttributes(
      parseWithBigInt(stringifyWithBigInt(workflowStartedHistoryEvent)),
    );

    expect(decodedPayload).toEqual(dataConvertedWorkflowStartedEvent);
    const dataConverterStatus = get(lastDataEncoderStatus);
    expect(dataConverterStatus).toEqual('success');
  });
});
