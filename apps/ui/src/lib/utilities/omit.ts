type Omit = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  <Source extends object, KeysToOmit extends string[]>(
    obj: Source,
    ...keys: KeysToOmit
  ): {
    [RemainingKey in Exclude<
      keyof Source,
      KeysToOmit[number]
    >]: Source[RemainingKey];
  };
};

export const omit: Omit = (object, ...keys) => {
  const result = {} as {
    [K in keyof typeof object]: (typeof object)[K];
  };

  for (const key of Object.keys(object)) {
    if (!keys.includes(key)) {
      result[key] = object[key];
    }
  }

  return result;
};
