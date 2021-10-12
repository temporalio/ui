const durationPattern =
  /(\d+)\s(years|months|weeks|days|hours|minutes|seconds)/;

export const toDuration = (value: string): Duration => {
  const [, amount, units] = value.match(durationPattern);
  return { [units]: parseInt(amount, 10) };
};

export const toString = (duration: Duration): string => {
  const units = Object.keys(duration)[0];
  const amount: number = duration[units];
  return `${amount} ${units}`;
};
