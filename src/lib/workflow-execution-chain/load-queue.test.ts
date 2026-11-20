import { describe, expect, it } from 'vitest';

import { LoadQueue } from './load-queue';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const createQueue = (concurrency = 2) => {
  const started: string[] = [];
  const finishers = new Map<string, (error?: unknown) => void>();
  const queue = new LoadQueue({
    concurrency,
    start: (id) => {
      started.push(id);
      return new Promise<void>((resolve, reject) => {
        finishers.set(id, (error) => (error ? reject(error) : resolve()));
      });
    },
  });
  const finish = async (id: string, error?: unknown) => {
    finishers.get(id)?.(error);
    await flush();
  };
  return { queue, started, finish };
};

describe('LoadQueue', () => {
  it('starts held', () => {
    const { queue, started } = createQueue();
    queue.push('a');

    expect(started).toEqual([]);
    expect(queue.pending).toEqual(['a']);
  });

  it('runs in push order up to the concurrency limit once released', async () => {
    const { queue, started, finish } = createQueue(2);
    queue.push('a');
    queue.push('b');
    queue.push('c');
    queue.release();

    expect(started).toEqual(['a', 'b']);

    await finish('a');
    expect(started).toEqual(['a', 'b', 'c']);
  });

  it('ignores ids already queued or running', () => {
    const { queue, started } = createQueue(1);
    queue.release();
    queue.push('a');
    queue.push('a');
    queue.push('b');
    queue.push('b');

    expect(started).toEqual(['a']);
    expect(queue.pending).toEqual(['b']);
  });

  it('prioritize moves an id to the head', async () => {
    const { queue, started, finish } = createQueue(1);
    queue.push('a');
    queue.push('b');
    queue.push('c');
    queue.prioritize('c');
    queue.release();

    expect(started).toEqual(['c']);
    await finish('c');
    expect(started).toEqual(['c', 'a']);
  });

  it('stops starting while held, without stopping running loads', async () => {
    const { queue, started, finish } = createQueue(1);
    queue.push('a');
    queue.push('b');
    queue.release();
    queue.hold();

    await finish('a');
    expect(started).toEqual(['a']);

    queue.release();
    expect(started).toEqual(['a', 'b']);
  });

  it('frees the slot when a load fails', async () => {
    const { queue, started, finish } = createQueue(1);
    queue.push('a');
    queue.push('b');
    queue.release();

    await finish('a', new Error('boom'));

    expect(started).toEqual(['a', 'b']);
  });

  it('remove drops a pending id', () => {
    const { queue, started } = createQueue(1);
    queue.push('a');
    queue.push('b');
    queue.remove('a');
    queue.release();

    expect(started).toEqual(['b']);
  });

  it('starts nothing after dispose', async () => {
    const { queue, started, finish } = createQueue(1);
    queue.push('a');
    queue.push('b');
    queue.release();
    queue.dispose();

    await finish('a');
    queue.push('c');

    expect(started).toEqual(['a']);
  });
});
