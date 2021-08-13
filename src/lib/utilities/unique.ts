export const unique = <T>(value: T, index: number, self: T[]): boolean =>
  self.indexOf(value) === index;
