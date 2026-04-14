import { describe, expect, it } from 'vitest';

import type { ParsedPayload, RawPayload } from './decode-payload';
import {
  decodePayload,
  decodePayloadAttributes,
  parsePayload,
  parsePayloadAttributes,
} from './decode-payload';
import {
  getTestPayloadEvent,
  workflowStartedEvent,
} from './decode-payload-test-fixtures';

const jsonPlainEncoding = btoa('json/plain');
const binaryNullEncoding = btoa('binary/null');
const keywordType = btoa('Keyword');

function encode(value: unknown): string {
  return btoa(JSON.stringify(value));
}

describe('parsePayload', () => {
  describe('basic decoding', () => {
    it('decodes a json/plain payload with string data', () => {
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
        data: encode('test@test.com'),
      };
      const result = parsePayload(raw);
      expect(result.data).toBe('test@test.com');
      expect(result.phase).toBe('parsed');
      expect(result.metadata?.encoding).toBe('json/plain');
      expect(result.errors).toBeUndefined();
    });

    it('decodes a json/plain payload with object data', () => {
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
        data: encode({ test: 'detail' }),
      };
      const result = parsePayload(raw);
      expect(result.data).toEqual({ test: 'detail' });
      expect(result.phase).toBe('parsed');
    });

    it('decodes multiple metadata fields', () => {
      const raw: RawPayload = {
        metadata: {
          encoding: jsonPlainEncoding,
          type: keywordType,
        },
        data: encode('hello'),
      };
      const result = parsePayload(raw);
      expect(result.metadata?.encoding).toBe('json/plain');
      expect(result.metadata?.type).toBe('Keyword');
      expect(result.data).toBe('hello');
    });

    it('preserves BigInt values in data', () => {
      const bigNumber = '9007199254740993';
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
        data: btoa(bigNumber),
      };
      const result = parsePayload(raw);
      expect(result.data).toBe(BigInt(bigNumber));
    });
  });

  describe('binary/null handling', () => {
    it('returns null data for binary/null encoding', () => {
      const raw: RawPayload = {
        metadata: { encoding: binaryNullEncoding },
        data: '',
      };
      const result = parsePayload(raw);
      expect(result.data).toBeNull();
      expect(result.metadata?.encoding).toBe('binary/null');
      expect(result.phase).toBe('parsed');
      expect(result.errors).toBeUndefined();
    });

    it('returns null data for binary/null with null data field', () => {
      const raw: RawPayload = {
        metadata: { encoding: binaryNullEncoding },
      };
      const result = parsePayload(raw);
      expect(result.data).toBeNull();
      expect(result.phase).toBe('parsed');
    });
  });

  describe('error handling', () => {
    it('keeps atob result in data when parseWithBigInt fails', () => {
      const notJson = btoa('not valid json {{{');
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
        data: notJson,
      };
      const result = parsePayload(raw);
      expect(result.data).toBe('not valid json {{{');
      expect(result.errors?.data).toBeDefined();
      expect(result.phase).toBe('parsed');
    });

    it('keeps raw data string when atob fails', () => {
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
        data: '!!!not-base64!!!',
      };
      const result = parsePayload(raw);
      expect(result.errors?.data).toBeDefined();
      expect(result.phase).toBe('parsed');
    });

    it('handles invalid base64 in metadata gracefully (atob returns original string)', () => {
      const raw: RawPayload = {
        metadata: { encoding: '!!!not-base64!!!' },
        data: encode('test'),
      };
      const result = parsePayload(raw);
      expect(result.metadata?.encoding).toBe('!!!not-base64!!!');
      expect(result.phase).toBe('parsed');
    });

    it('omits errors field when no errors occur', () => {
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
        data: encode('test'),
      };
      const result = parsePayload(raw);
      expect(result.errors).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles null payload', () => {
      const result = parsePayload(null as unknown as RawPayload);
      expect(result.data).toBeNull();
      expect(result.phase).toBe('parsed');
    });

    it('handles undefined payload', () => {
      const result = parsePayload(undefined as unknown as RawPayload);
      expect(result.data).toBeNull();
      expect(result.phase).toBe('parsed');
    });

    it('handles payload with missing metadata', () => {
      const raw: RawPayload = {
        data: encode('test'),
      };
      const result = parsePayload(raw);
      expect(result.data).toBe('test');
      expect(result.metadata).toBeUndefined();
      expect(result.phase).toBe('parsed');
    });

    it('handles payload with missing data', () => {
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
      };
      const result = parsePayload(raw);
      expect(result.data).toBeNull();
      expect(result.metadata?.encoding).toBe('json/plain');
      expect(result.phase).toBe('parsed');
    });

    it('handles payload with empty data string', () => {
      const raw: RawPayload = {
        metadata: { encoding: jsonPlainEncoding },
        data: '',
      };
      const result = parsePayload(raw);
      expect(result.data).toBeNull();
      expect(result.phase).toBe('parsed');
    });

    it('handles payload with empty metadata object', () => {
      const raw: RawPayload = {
        metadata: {},
        data: encode('test'),
      };
      const result = parsePayload(raw);
      expect(result.data).toBe('test');
      expect(result.metadata).toEqual({});
      expect(result.phase).toBe('parsed');
    });

    it('always returns phase: parsed', () => {
      const cases: RawPayload[] = [
        { metadata: { encoding: jsonPlainEncoding }, data: encode('a') },
        { metadata: { encoding: binaryNullEncoding } },
        { data: encode(42) },
        {},
      ];
      for (const raw of cases) {
        expect(parsePayload(raw).phase).toBe('parsed');
      }
    });
  });
});

describe('parsePayloadAttributes', () => {
  describe('equivalence with decodePayloadAttributes', () => {
    it('produces same data values for workflowStartedEvent searchAttributes', () => {
      const forLegacy = structuredClone(workflowStartedEvent);
      const forNew = structuredClone(workflowStartedEvent);

      const legacy = decodePayloadAttributes(forLegacy);
      const modern = parsePayloadAttributes(forNew);

      const modernEmail = modern.searchAttributes.indexedFields
        .CandidateEmail as unknown as ParsedPayload;
      expect(modernEmail.data).toEqual(
        legacy.searchAttributes.indexedFields.CandidateEmail,
      );
      expect(modernEmail.phase).toBe('parsed');
      expect(modernEmail.metadata?.encoding).toBe('json/plain');
      expect(modernEmail.metadata?.type).toBe('Keyword');
    });

    it('decodes input.payloads that decodePayloadAttributes does not touch', () => {
      const forNew = structuredClone(workflowStartedEvent);
      const modern = parsePayloadAttributes(forNew);

      const payload = modern.input.payloads[0] as unknown as ParsedPayload;
      expect(payload.data).toBe('test@test.com');
      expect(payload.phase).toBe('parsed');
    });

    it('produces same data values for getTestPayloadEvent searchAttributes', () => {
      const forLegacy = getTestPayloadEvent();
      const forNew = getTestPayloadEvent();

      decodePayloadAttributes(forLegacy);
      parsePayloadAttributes(forNew);

      const modernPayload = forNew.input
        .payloads[0] as unknown as ParsedPayload;
      expect(modernPayload.data).toBe('test@test.com');
      expect(modernPayload.phase).toBe('parsed');
    });

    it('matches decodePayload data output for a single payload', () => {
      const raw = {
        metadata: { encoding: jsonPlainEncoding, type: keywordType },
        data: encode('whadup@lolcats.com'),
      };
      const legacyResult = decodePayload(raw, true);
      const modernResult = parsePayload(raw as RawPayload);
      expect(modernResult.data).toEqual(legacyResult);
    });
  });

  describe('recursive traversal', () => {
    it('decodes payloads inside input.payloads array', () => {
      const obj = {
        input: {
          payloads: [
            {
              metadata: { encoding: jsonPlainEncoding },
              data: encode('value1'),
            },
            {
              metadata: { encoding: jsonPlainEncoding },
              data: encode('value2'),
            },
          ],
        },
      };
      parsePayloadAttributes(obj);
      expect((obj.input.payloads[0] as unknown as ParsedPayload).data).toBe(
        'value1',
      );
      expect((obj.input.payloads[1] as unknown as ParsedPayload).data).toBe(
        'value2',
      );
    });

    it('decodes searchAttributes.indexedFields payloads', () => {
      const obj = {
        searchAttributes: {
          indexedFields: {
            Email: {
              metadata: { encoding: jsonPlainEncoding, type: keywordType },
              data: encode('test@example.com'),
            },
          },
        },
      };
      parsePayloadAttributes(obj);
      const email = obj.searchAttributes.indexedFields
        .Email as unknown as ParsedPayload;
      expect(email.data).toBe('test@example.com');
      expect(email.phase).toBe('parsed');
    });

    it('decodes memo.fields payloads', () => {
      const obj = {
        memo: {
          fields: {
            note: {
              metadata: { encoding: jsonPlainEncoding },
              data: encode('my memo'),
            },
          },
        },
      };
      parsePayloadAttributes(obj);
      const note = obj.memo.fields.note as unknown as ParsedPayload;
      expect(note.data).toBe('my memo');
    });

    it('decodes header.fields payloads', () => {
      const obj = {
        header: {
          fields: {
            auth: {
              metadata: { encoding: jsonPlainEncoding },
              data: encode('token123'),
            },
          },
        },
      };
      parsePayloadAttributes(obj);
      const auth = obj.header.fields.auth as unknown as ParsedPayload;
      expect(auth.data).toBe('token123');
    });

    it('handles null values in fields', () => {
      const obj = {
        header: {
          fields: {
            encryption: null,
          },
        },
      };
      parsePayloadAttributes(obj);
      expect(obj.header.fields.encryption).toBeNull();
    });

    it('decodes encodedAttributes single payload', () => {
      const obj = {
        encodedAttributes: {
          metadata: { encoding: jsonPlainEncoding },
          data: encode('a test attribute'),
        },
      };
      parsePayloadAttributes(obj);
      const attr = obj.encodedAttributes as unknown as ParsedPayload;
      expect(attr.data).toBe('a test attribute');
      expect(attr.phase).toBe('parsed');
    });

    it('decodes nested details payloads', () => {
      const obj = {
        details: {
          detail1: {
            payloads: [
              {
                metadata: { encoding: jsonPlainEncoding },
                data: encode({ test: 'detail' }),
              },
            ],
          },
        },
      };
      parsePayloadAttributes(obj);
      const detail = obj.details.detail1
        .payloads[0] as unknown as ParsedPayload;
      expect(detail.data).toEqual({ test: 'detail' });
    });
  });

  describe('deep nesting', () => {
    it('decodes payloads nested 5+ levels deep', () => {
      const obj = {
        a: {
          b: {
            c: {
              d: {
                e: {
                  metadata: { encoding: jsonPlainEncoding },
                  data: encode('deep'),
                },
              },
            },
          },
        },
      };
      parsePayloadAttributes(obj);
      const result = obj.a.b.c.d.e as unknown as ParsedPayload;
      expect(result.data).toBe('deep');
      expect(result.phase).toBe('parsed');
    });

    it('decodes multiple payloads at different depths', () => {
      const obj = {
        shallow: {
          metadata: { encoding: jsonPlainEncoding },
          data: encode('level1'),
        },
        nested: {
          deep: {
            payload: {
              metadata: { encoding: jsonPlainEncoding },
              data: encode('level3'),
            },
          },
        },
      };
      parsePayloadAttributes(obj);
      expect((obj.shallow as unknown as ParsedPayload).data).toBe('level1');
      expect((obj.nested.deep.payload as unknown as ParsedPayload).data).toBe(
        'level3',
      );
    });

    it('handles mixed arrays and objects at depth', () => {
      const obj = {
        items: [
          {
            payloads: [
              {
                metadata: { encoding: jsonPlainEncoding },
                data: encode('first'),
              },
            ],
          },
          {
            payloads: [
              {
                metadata: { encoding: jsonPlainEncoding },
                data: encode('second'),
              },
            ],
          },
        ],
      };
      parsePayloadAttributes(obj);
      expect((obj.items[0].payloads[0] as unknown as ParsedPayload).data).toBe(
        'first',
      );
      expect((obj.items[1].payloads[0] as unknown as ParsedPayload).data).toBe(
        'second',
      );
    });
  });

  describe('edge cases', () => {
    it('returns null for null input', () => {
      expect(parsePayloadAttributes(null)).toBeNull();
    });

    it('returns undefined for undefined input', () => {
      expect(parsePayloadAttributes(undefined)).toBeUndefined();
    });

    it('returns primitives unchanged', () => {
      expect(parsePayloadAttributes('hello')).toBe('hello');
      expect(parsePayloadAttributes(42)).toBe(42);
      expect(parsePayloadAttributes(true)).toBe(true);
    });

    it('handles empty objects', () => {
      const obj = {};
      expect(parsePayloadAttributes(obj)).toEqual({});
    });

    it('handles arrays of payloads', () => {
      const arr = [
        {
          metadata: { encoding: jsonPlainEncoding },
          data: encode('a'),
        },
        {
          metadata: { encoding: jsonPlainEncoding },
          data: encode('b'),
        },
      ];
      parsePayloadAttributes(arr);
      expect((arr[0] as unknown as ParsedPayload).data).toBe('a');
      expect((arr[1] as unknown as ParsedPayload).data).toBe('b');
    });

    it('skips already-parsed payloads with phase field', () => {
      const obj = {
        alreadyParsed: {
          metadata: { encoding: 'json/plain' },
          data: 'decoded value',
          phase: 'parsed',
        },
        raw: {
          metadata: { encoding: jsonPlainEncoding },
          data: encode('new'),
        },
      };
      parsePayloadAttributes(obj);
      expect(obj.alreadyParsed.data).toBe('decoded value');
      expect((obj.raw as unknown as ParsedPayload).data).toBe('new');
    });

    it('does not treat objects with only data key as payloads if data is not a string', () => {
      const obj = {
        notPayload: { data: 42 },
      };
      parsePayloadAttributes(obj);
      expect(obj.notPayload.data).toBe(42);
    });

    it('does not treat objects with non-object metadata as payloads', () => {
      const obj = {
        notPayload: { metadata: 'string', data: 'test' },
      };
      parsePayloadAttributes(obj);
      expect(obj.notPayload.data).toBe('test');
      expect(obj.notPayload.metadata).toBe('string');
    });
  });

  describe('type enforcement', () => {
    it('rejects ParsedPayload input to parsePayload at compile time', () => {
      const parsed: ParsedPayload = {
        metadata: { encoding: 'json/plain' },
        data: 'test',
        phase: 'parsed',
      };
      // @ts-expect-error ParsedPayload should not be assignable to RawPayload
      parsePayload(parsed);
    });
  });
});
