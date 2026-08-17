const defaultWait = (ms: number) =>
  new Promise<void>((resolveDone) => setTimeout(resolveDone, ms));

const isRetryableConnectionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);

  return /Connection refused|tcp connect error|ConnectError/i.test(message);
};

export const connectWithRetry = async <Connection>({
  connect,
  attempts = 30,
  delayMs = 1_000,
  onWaiting,
  retryable = isRetryableConnectionError,
  wait = defaultWait,
}: {
  connect: () => Promise<Connection>;
  attempts?: number;
  delayMs?: number;
  onWaiting?: (waiting: { attempt: number; error: unknown }) => void;
  retryable?: (error: unknown) => boolean;
  wait?: (ms: number) => Promise<void>;
}): Promise<Connection> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await connect();
    } catch (error) {
      if (!retryable(error)) throw error;

      lastError = error;

      if (attempt < attempts) {
        onWaiting?.({ attempt, error });
        await wait(delayMs);
      }
    }
  }

  throw lastError;
};
