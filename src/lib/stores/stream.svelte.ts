import { type SearchAttributes } from '$lib/types/workflows';

interface StreamOptions {
  onComplete?: (data: CompletionData) => void;
  onChunk?: (data: ChunkData) => void;
  onError?: (error: Error) => void;
  onStart?: (data: { prompt: string }) => void;
}

interface CompletionData {
  response: string;
  prompt: string;
  error: string | null;
  aborted: boolean;
}

interface ChunkData {
  text: string;
  fullText: string;
}

interface StreamStore {
  readonly response: string;
  readonly isStreaming: boolean;
  readonly error: string | null;
  stream(
    prompt: string,
    customSearchAttributes: SearchAttributes,
    options?: StreamOptions,
  ): Promise<void>;
  cancel(): void;
  clear(): void;
  onComplete(callback: (data: CompletionData) => void): () => void;
  onChunk(callback: (data: ChunkData) => void): () => void;
}

export function createStreamStore(): StreamStore {
  let response = $state<string>('');
  let isStreaming = $state<boolean>(false);
  let error = $state<string | null>(null);
  let abortController = $state<AbortController | null>(null);
  let onCompleteCallbacks: ((data: CompletionData) => void)[] = [];
  let onChunkCallbacks: ((data: ChunkData) => void)[] = [];

  return {
    get response() {
      return response;
    },
    get isStreaming() {
      return isStreaming;
    },
    get error() {
      return error;
    },

    async stream(
      prompt: string,
      customSearchAttributes: SearchAttributes,
      options: StreamOptions = {},
    ) {
      response = '';
      isStreaming = true;
      error = null;
      abortController = new AbortController();

      const { onComplete, onChunk, onError, onStart } = options;

      try {
        if (onStart) {
          onStart({ prompt });
        }

        const res = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, customSearchAttributes }),
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch');

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                isStreaming = false;
                fullResponse = response;
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                response += parsed.text;

                if (onChunk) {
                  onChunk({
                    text: parsed.text,
                    fullText: response,
                  });
                }

                onChunkCallbacks.forEach((cb) =>
                  cb({
                    text: parsed.text,
                    fullText: response,
                  }),
                );
              } catch (e) {
                if (
                  e instanceof Error &&
                  e.message !== 'Unexpected end of JSON input'
                ) {
                  throw e;
                }
              }
            }
          }
        }

        const completionData: CompletionData = {
          response: fullResponse,
          prompt,
          error: null,
          aborted: false,
        };

        if (onComplete) {
          onComplete(completionData);
        }

        onCompleteCallbacks.forEach((cb) => cb(completionData));
      } catch (err) {
        const wasAborted = err instanceof Error && err.name === 'AbortError';
        if (!wasAborted) {
          error = err instanceof Error ? err.message : 'Unknown error';
        }

        const completionData: CompletionData = {
          response,
          prompt,
          error: wasAborted
            ? null
            : err instanceof Error
              ? err.message
              : 'Unknown error',
          aborted: wasAborted,
        };

        if (onError && !wasAborted && err instanceof Error) {
          onError(err);
        }

        if (onComplete) {
          onComplete(completionData);
        }

        onCompleteCallbacks.forEach((cb) => cb(completionData));
      } finally {
        isStreaming = false;
        abortController = null;
      }
    },

    cancel() {
      if (abortController) {
        abortController.abort();
        isStreaming = false;
      }
    },

    clear() {
      response = '';
      error = null;
    },

    onComplete(callback: (data: CompletionData) => void) {
      onCompleteCallbacks.push(callback);
      return () => {
        onCompleteCallbacks = onCompleteCallbacks.filter(
          (cb) => cb !== callback,
        );
      };
    },

    onChunk(callback: (data: ChunkData) => void) {
      onChunkCallbacks.push(callback);
      return () => {
        onChunkCallbacks = onChunkCallbacks.filter((cb) => cb !== callback);
      };
    },
  };
}
