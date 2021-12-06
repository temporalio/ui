export function isPromise(obj: any): obj is Promise<unknown> {
  if (
    typeof obj?.then === 'function' &&
    typeof obj?.catch === 'function' &&
    typeof obj?.finally === 'function'
  ) {
    return true;
  }

  return false;
}
