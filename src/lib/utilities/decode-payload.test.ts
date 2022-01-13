/**
 * @jest-environment jsdom
 */

// Use jsdom jest environment for access to window.atob

import { decodePayload } from './decode-payload-lazy';
import { convertPayloadToJson } from './decode-payload';
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

convertPayloadToJson();
const Base64Decoded = 'test@test.com';

describe(decodePayload, () => {
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
