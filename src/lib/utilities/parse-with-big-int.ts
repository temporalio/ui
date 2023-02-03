import JSONbig from 'json-bigint';

JSONbig({
  useNativeBigInt: true,
  // This should work but doesn't
  constructorAction: 'preserve'
});

export const parseWithBigInt = (content: string) => JSONbig.parse(content);

export const stringifyWithBigInt = <T = unknown>(
  value: T,
  replacer?: (key: string, value: T) => T,
  space?: string | number,
) => JSONbig.stringify(value, replacer, space);
