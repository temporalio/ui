export const encodings = ['json/plain', 'json/protobuf'] as const;

export type PayloadInputEncoding = (typeof encodings)[number];

export const isPayloadInputEncodingType = (
  x: unknown,
): x is PayloadInputEncoding => encodings.includes(x as PayloadInputEncoding);
