import { type Writable, writable } from 'svelte/store';

type CopiedToClipboardReturnValue = {
  copy: (event: Event, content: string) => Promise<void>;
  copied: Writable<boolean>;
};

export const copyToClipboard = (
  timeout = 2000,
): CopiedToClipboardReturnValue => {
  const copied = writable(false);

  const copy = async (event: Event, content: string) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      copied.set(true);
      setTimeout(() => {
        copied.set(false);
      }, timeout);
    } catch (error) {
      console.error(error);
    }
  };

  return { copy, copied };
};
