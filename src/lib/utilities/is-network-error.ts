export function isNetworkError(
  error: unknown | NetworkError,
): error is NetworkError {
  const networkErr = error as NetworkError;
  return (
    networkErr?.statusCode !== undefined &&
    networkErr?.statusText !== undefined &&
    networkErr?.response !== undefined
  );
}
