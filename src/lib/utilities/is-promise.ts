// https://github.com/typescript-eslint/typescript-eslint/issues/1071#issuecomment-541921864
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function isPromise(obj: any): obj is Promise<unknown> {
  if (
    typeof obj?.then === 'function' &&
    typeof obj?.catch === 'function' &&
    typeof obj?.finally === 'function' &&
    obj.toString() === '[object Promise]'
  ) {
    return true;
  }

  return false;
}
