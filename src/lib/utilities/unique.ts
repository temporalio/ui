export const unique = <T>(value: T, index: number, self: T[]) =>
  self.indexOf(value) === index;
