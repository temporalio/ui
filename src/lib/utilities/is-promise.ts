export function isPromise(promiseTentially: any): Boolean {
  if (
    typeof promiseTentially?.then === 'function' &&
    typeof promiseTentially?.catch === 'function' &&
    typeof promiseTentially?.finally === 'function'
  ) {
    return true;
  }

  return false;
}
