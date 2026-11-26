import type { Attachment } from 'svelte/attachments';

export interface TruncationAttachmentOptions {
  onTruncationChange: (isTruncated: boolean) => void;
}

const isElementTruncated = (element: HTMLElement): boolean =>
  element.scrollWidth > element.clientWidth;

export const createTruncationAttachment =
  ({
    onTruncationChange,
  }: TruncationAttachmentOptions): Attachment<HTMLElement> =>
  (element) => {
    let wasTruncated: boolean | undefined;

    const measure = () => {
      const isTruncated = isElementTruncated(element);
      if (isTruncated === wasTruncated) {
        return;
      }
      wasTruncated = isTruncated;
      onTruncationChange(isTruncated);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  };
