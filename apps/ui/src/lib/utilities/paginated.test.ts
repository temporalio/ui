import { afterEach, describe, expect, it, vi } from 'vitest';

import { paginated } from './paginated';

const getPage = async (token: string | Uint8Array | null = null) => {
  if (!token)
    return {
      items: [1, 2, 3],
      nextPageToken: '1',
    };

  if (token === '1')
    return {
      items: [4, 5, 6],
      nextPageToken: '2',
    };

  if (token === '2')
    return {
      items: [7, 8, 9],
      nextPageToken: '3',
    };

  if (token === '3')
    return {
      items: [10, 11, 12],
      nextPageToken: null,
    };
};

describe('paginated', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof paginated).toBe('function');
  });

  it('should return a promise with the first page of data', () => {
    const fetchMock = vi.fn().mockImplementation(getPage);
    return paginated((token) => fetchMock(token)).then((result) =>
      expect(result).toEqual({
        items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      }),
    );
  });

  it('should collect incremental updates with an onUpdate callback', () => {
    const fetchMock = vi.fn().mockImplementation(getPage);
    const mockCallback = vi.fn().mockImplementation((x) => x);
    return paginated((token) => fetchMock(token), {
      onUpdate: mockCallback,
    }).then(() => {
      expect(mockCallback.mock.calls.length).toBe(4);
    });
  });

  it('should call onStart if provided', () => {
    const fetchMock = vi.fn().mockImplementation(getPage);
    const onStart = vi.fn();
    return paginated((token) => fetchMock(token), { onStart }).then(() => {
      expect(onStart).toHaveBeenCalled();
    });
  });

  it('should call onError if provided and an error is thrown', () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      throw new Error('Boom!');
    });
    const onError = vi.fn();
    return paginated((token) => fetchMock(token), { onError }).then(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should not call onError if provided and an error is not thrown', () => {
    const fetchMock = vi.fn().mockImplementation(getPage);
    const onError = vi.fn();
    return paginated((token) => fetchMock(token), { onError }).then(() => {
      expect(onError).not.toHaveBeenCalled();
    });
  });

  it('should call onComplete if provided', () => {
    const fetchMock = vi.fn().mockImplementation(getPage);
    const onComplete = vi.fn();

    return paginated((token) => fetchMock(token), { onComplete }).then(() => {
      expect(onComplete).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledWith({
        items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      });
    });
  });
});
