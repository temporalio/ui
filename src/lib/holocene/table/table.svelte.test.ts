import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Harness, {
  examplePages,
  type SortableItem,
} from './paginated-table/api-paginated-sort-harness.svelte';

type Page = {
  items: SortableItem[];
  nextPageToken: string;
};

type ControlledAnimation = {
  currentTime: number;
  effect: AnimationEffect | null;
  playState: AnimationPlayState;
  onfinish: Animation['onfinish'];
  cancel: () => void;
  finish: () => void;
};

type AnimationCall = {
  animation: ControlledAnimation;
  options: KeyframeAnimationOptions;
};

const createDeferred = () => {
  let resolve!: (page: Page) => void;
  const promise = new Promise<Page>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('Table updating transition', () => {
  let target: HTMLDivElement;
  let component: { refresh: () => void };
  let animate: ReturnType<typeof vi.fn>;
  let animations: AnimationCall[];
  let scrollIntoViewDescriptor: PropertyDescriptor | undefined;
  const fetchPage = vi.fn(async () => ({
    items: examplePages[0],
    nextPageToken: 'page-2',
  }));

  const startUpdate = async () => {
    const request = createDeferred();
    const fetchCallCount = fetchPage.mock.calls.length;
    const animationCount = animations.length;
    fetchPage.mockImplementationOnce(() => request.promise);
    target
      .querySelector<HTMLButtonElement>('button[aria-label="Next"]')!
      .click();
    flushSync();
    await vi.waitFor(() =>
      expect(fetchPage).toHaveBeenCalledTimes(fetchCallCount + 1),
    );
    await vi.waitFor(() => expect(animations).toHaveLength(animationCount + 1));
    return request;
  };

  const finish = (index: number) => {
    animations[index].animation.finish();
    flushSync();
  };

  beforeEach(async () => {
    animations = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollIntoView',
    );
    HTMLElement.prototype.scrollIntoView = vi.fn();
    animate = vi.fn(
      (
        _keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
        options?: number | KeyframeAnimationOptions,
      ) => {
        const animationOptions =
          typeof options === 'number' ? { duration: options } : (options ?? {});
        const animation: ControlledAnimation = {
          currentTime: 0,
          effect: null,
          playState: 'running',
          onfinish: null,
          cancel: vi.fn(),
          finish: () => {},
        };
        animation.finish = () => {
          animation.currentTime = Number(animationOptions.duration ?? 0);
          animation.playState = 'finished';
          animation.onfinish?.call(
            animation as unknown as Animation,
            new Event('finish') as AnimationPlaybackEvent,
          );
        };
        animations.push({ animation, options: animationOptions });
        return animation;
      },
    );
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: animate,
    });
    target = document.createElement('div');
    document.body.appendChild(target);
    component = mount(Harness, {
      target,
      props: { onFetch: async () => fetchPage },
    });
    flushSync();
    await vi.waitFor(() =>
      expect(target.querySelectorAll('tbody tr[data-name]')).toHaveLength(3),
    );
  });

  afterEach(async () => {
    await unmount(component);
    target.remove();
    delete (Element.prototype as { animate?: unknown }).animate;
    if (scrollIntoViewDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        'scrollIntoView',
        scrollIntoViewDescriptor,
      );
    } else {
      delete (HTMLElement.prototype as { scrollIntoView?: unknown })
        .scrollIntoView;
    }
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('suppresses entry until the 150ms delay completes', async () => {
    await startUpdate();

    expect(animations).toHaveLength(1);
    expect(animations[0].options.duration).toBe(150);
  });

  it('runs the 250ms entry and 350ms exit phases', async () => {
    const request = await startUpdate();
    finish(0);

    expect(animations).toHaveLength(2);
    expect(animations[1].options.duration).toBe(250);

    finish(1);
    request.resolve({ items: examplePages[0], nextPageToken: 'page-2' });
    await vi.waitFor(() => expect(animations).toHaveLength(3));
    finish(2);

    expect(animations).toHaveLength(4);
    expect(animations[3].options.duration).toBe(350);

    finish(3);
    await vi.waitFor(() =>
      expect(target.querySelector('thead tr[aria-hidden="true"]')).toBeNull(),
    );
  });

  it('starts a new entry when updating resumes during exit', async () => {
    const request = await startUpdate();
    finish(0);
    finish(1);
    request.resolve({ items: examplePages[0], nextPageToken: 'page-2' });
    await vi.waitFor(() => expect(animations).toHaveLength(3));
    finish(2);

    expect(animations[3].options.duration).toBe(350);
    animations[3].animation.currentTime = 175;

    await startUpdate();

    expect(animations).toHaveLength(5);
    expect(animations[4].options.duration).toBe(150);
    expect(animations[3].animation.cancel).toHaveBeenCalled();

    finish(4);

    expect(animations).toHaveLength(6);
    expect(animations[5].options.duration).toBe(250);
    expect(target.querySelector('thead tr[aria-hidden="true"]')).not.toBeNull();
  });
});
