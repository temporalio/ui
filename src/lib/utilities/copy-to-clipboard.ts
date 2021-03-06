import { Writable, writable } from 'svelte/store';

type CopiedToClipboardReturnValue = {
  copy: (event: Event) => Promise<void>;
  copied: Writable<boolean>;
};

export const copyToClipboard = (
  content: string,
  timeout = 2000,
): CopiedToClipboardReturnValue => {
  const copied = writable(false);

  const copy = async (event: Event) => {
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
