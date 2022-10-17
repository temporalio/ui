import JSONbig from 'json-bigint';

export const parseWithBigInt = (content: string) =>
  JSONbig.parse(content, {
    useNativeBigInt: true,
  });

export const stringifyWithBigInt = (
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
) => JSONbig.stringify(value, replacer, space);
