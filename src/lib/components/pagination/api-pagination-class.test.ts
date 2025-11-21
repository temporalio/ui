import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiPagination } from './api-pagination-class.svelte';

function identity<T>(i: T) {
  return i;
}
// Mock data structure
type TestItem = {
  id: string;
  value: number;
};

type TestParams = {
  pageSize: number;
  pageToken?: string;
  customParam?: string;
};

type TestResponse = {
  items: TestItem[];
  nextPageToken?: string;
  total: number;
};

// Mock API function that generates test data
const createMockApiFetch = () => {
  const mockFn = vi.fn();

  // Generate 5 pages of data
  const generatePageData = (
    pageNumber: number,
    pageSize: number,
  ): TestItem[] => {
    return Array.from({ length: pageSize }, (_, index) => ({
      id: pageNumber === 0 ? `${index}` : `${pageNumber}-${index}`,
      value: pageNumber === 0 ? index : parseInt(`${pageNumber}${index}`),
    }));
  };

  const pages = [
    generatePageData(0, 3), // page 0: [{id: "0", value: 0}, {id: "1", value: 1}, {id: "2", value: 2}]
    generatePageData(1, 3), // page 1: [{id: "1-0", value: 10}, {id: "1-1", value: 11}, {id: "1-2", value: 12}]
    generatePageData(2, 3), // page 2: [{id: "2-0", value: 20}, {id: "2-1", value: 21}, {id: "2-2", value: 22}]
    generatePageData(3, 3), // page 3: [{id: "3-0", value: 30}, {id: "3-1", value: 31}, {id: "3-2", value: 32}]
    generatePageData(4, 3), // page 4: [{id: "4-0", value: 40}, {id: "4-1", value: 41}, {id: "4-2", value: 42}]
  ];

  mockFn.mockImplementation((params: TestParams): Promise<TestResponse> => {
    return new Promise((resolve) => {
      let currentPageIndex = 0;

      // Determine current page from token
      if (params.pageToken) {
        currentPageIndex = parseInt(params.pageToken);
      }

      const currentPageData = pages[currentPageIndex] || [];
      const nextPageIndex = currentPageIndex + 1;
      const hasNextPage = nextPageIndex < pages.length;

      // Adjust page size if different from default
      let items = currentPageData;
      if (params.pageSize && params.pageSize !== 3) {
        items = currentPageData.slice(0, params.pageSize);
      }

      resolve({
        items,
        nextPageToken: hasNextPage ? nextPageIndex.toString() : undefined,
        total: 15, // 5 pages * 3 items each
      });
    });
  });

  return { mockFn, pages };
};

describe('ApiPagination', () => {
  let mockApiFetch: ReturnType<typeof createMockApiFetch>;
  let pagination: ApiPagination<
    typeof mockApiFetch.mockFn,
    TestResponse,
    'items',
    'nextPageToken',
    'pageSize',
    'pageToken'
  >;

  beforeEach(() => {
    mockApiFetch = createMockApiFetch();
    pagination = new ApiPagination({
      onFetch: mockApiFetch.mockFn,
      itemsKeyname: 'items',
      nextPageKeyname: 'nextPageToken',
      sizeKeyname: 'pageSize',
      pageTokenKeyname: 'pageToken',
      pageSizeOptions: [3, 5, 10],
      defaultPageSize: 3,
      total: 15,
      transformFunction: identity,
    });
  });

  it('should initialize with correct default values', () => {
    expect(pagination.currentItems).toEqual([]);
    expect(pagination.loading).toBe(false);
    expect(pagination.updating).toBe(false);
    expect(pagination.error).toBeUndefined();
    expect(pagination.pageSize).toBe(3);
    expect(pagination.currentPage).toBe(0);
    expect(pagination.hasNextPage).toBe(false);
    expect(pagination.hasPreviousPage).toBe(false);
  });

  it('should fetch initial data correctly', async () => {
    await pagination.fetch({ pageSize: 3 });

    expect(mockApiFetch.mockFn).toHaveBeenCalledWith({
      pageSize: 3,
    });

    expect(pagination.currentItems).toEqual([
      { id: '0', value: 0 },
      { id: '1', value: 1 },
      { id: '2', value: 2 },
    ]);
    expect(pagination.hasNextPage).toBe(true);
    expect(pagination.currentPage).toBe(0);
  });

  it('should navigate forward through all pages', async () => {
    await pagination.fetch({ pageSize: 3 });

    // Page 0 -> Page 1
    await pagination.nextPage();
    expect(pagination.currentItems).toEqual([
      { id: '1-0', value: 10 },
      { id: '1-1', value: 11 },
      { id: '1-2', value: 12 },
    ]);
    expect(pagination.currentPage).toBe(1);
    expect(pagination.hasNextPage).toBe(true);

    // Page 1 -> Page 2
    await pagination.nextPage();
    expect(pagination.currentItems).toEqual([
      { id: '2-0', value: 20 },
      { id: '2-1', value: 21 },
      { id: '2-2', value: 22 },
    ]);
    expect(pagination.currentPage).toBe(2);
    expect(pagination.hasNextPage).toBe(true);

    // Page 2 -> Page 3
    await pagination.nextPage();
    expect(pagination.currentItems).toEqual([
      { id: '3-0', value: 30 },
      { id: '3-1', value: 31 },
      { id: '3-2', value: 32 },
    ]);
    expect(pagination.currentPage).toBe(3);
    expect(pagination.hasNextPage).toBe(true);

    // Page 3 -> Page 4 (last page)
    await pagination.nextPage();
    expect(pagination.currentItems).toEqual([
      { id: '4-0', value: 40 },
      { id: '4-1', value: 41 },
      { id: '4-2', value: 42 },
    ]);
    expect(pagination.currentPage).toBe(4);
    expect(pagination.hasNextPage).toBe(false);
  });

  it('should navigate backward through all pages', async () => {
    // Go to last page first
    await pagination.fetch({ pageSize: 3 });
    await pagination.nextPage();
    await pagination.nextPage();
    await pagination.nextPage();
    await pagination.nextPage();

    expect(pagination.currentPage).toBe(4);

    // Page 4 -> Page 3
    pagination.previousPage();
    expect(pagination.currentItems).toEqual([
      { id: '3-0', value: 30 },
      { id: '3-1', value: 31 },
      { id: '3-2', value: 32 },
    ]);
    expect(pagination.currentPage).toBe(3);
    expect(pagination.hasPreviousPage).toBe(true);

    // Page 3 -> Page 2
    pagination.previousPage();
    expect(pagination.currentItems).toEqual([
      { id: '2-0', value: 20 },
      { id: '2-1', value: 21 },
      { id: '2-2', value: 22 },
    ]);
    expect(pagination.currentPage).toBe(2);

    // Page 2 -> Page 1
    pagination.previousPage();
    expect(pagination.currentItems).toEqual([
      { id: '1-0', value: 10 },
      { id: '1-1', value: 11 },
      { id: '1-2', value: 12 },
    ]);
    expect(pagination.currentPage).toBe(1);

    // Page 1 -> Page 0
    pagination.previousPage();
    expect(pagination.currentItems).toEqual([
      { id: '0', value: 0 },
      { id: '1', value: 1 },
      { id: '2', value: 2 },
    ]);
    expect(pagination.currentPage).toBe(0);
    expect(pagination.hasPreviousPage).toBe(false);
  });

  it('should handle page size changes correctly', async () => {
    await pagination.fetch({ pageSize: 3 });

    expect(mockApiFetch.mockFn).toHaveBeenLastCalledWith({
      pageSize: 3,
    });

    // Change page size
    pagination.setPageSize(5);

    expect(mockApiFetch.mockFn).toHaveBeenLastCalledWith({
      pageSize: 5,
    });
    expect(pagination.pageSize).toBe(5);
  });

  it('should pass custom fetch params through', async () => {
    await pagination.fetch({
      pageSize: 3,
      customParam: 'test-value',
    });

    expect(mockApiFetch.mockFn).toHaveBeenCalledWith({
      pageSize: 3,
      customParam: 'test-value',
    });
  });

  it('should apply transform function correctly', async () => {
    const transformPagination = new ApiPagination({
      onFetch: mockApiFetch.mockFn,
      itemsKeyname: 'items',
      nextPageKeyname: 'nextPageToken',
      sizeKeyname: 'pageSize',
      pageTokenKeyname: 'pageToken',
      transformFunction: (item: TestItem) => ({
        ...item,
        transformedId: `transformed-${item.id}`,
        doubledValue: item.value * 2,
      }),
    });

    await transformPagination.fetch({ pageSize: 3 });

    expect(transformPagination.currentItems).toEqual([
      { id: '0', value: 0, transformedId: 'transformed-0', doubledValue: 0 },
      { id: '1', value: 1, transformedId: 'transformed-1', doubledValue: 2 },
      { id: '2', value: 2, transformedId: 'transformed-2', doubledValue: 4 },
    ]);
  });

  it('should return original items when no transform function is provided', async () => {
    await pagination.fetch({ pageSize: 3 });

    const expectedItems = [
      { id: '0', value: 0 },
      { id: '1', value: 1 },
      { id: '2', value: 2 },
    ];

    expect(pagination.currentItems).toEqual(expectedItems);

    // Verify the items are the exact same structure as returned by the API
    expect(pagination.currentItems).toEqual(mockApiFetch.pages[0]);
  });

  it('should handle errors correctly', async () => {
    const errorMockFn = vi.fn().mockRejectedValue(new Error('API Error'));
    const onErrorSpy = vi.fn();

    const errorPagination = new ApiPagination({
      onFetch: errorMockFn,
      itemsKeyname: 'items',
      nextPageKeyname: 'nextPageToken',
      sizeKeyname: 'pageSize',
      pageTokenKeyname: 'pageToken',
      transformFunction: identity,
      onError: onErrorSpy,
    });

    let caughtError = false;
    try {
      await errorPagination.fetch({ pageSize: 3 });
    } catch (error) {
      caughtError = true;
      // Error should be thrown
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('API Error');
    }

    expect(caughtError).toBe(true);
    expect(errorPagination.error).toBeInstanceOf(Error);
    expect(errorPagination.error?.message).toBe('API Error');
    expect(onErrorSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should calculate index ranges correctly', async () => {
    await pagination.fetch({ pageSize: 3 });

    expect(pagination.indexStart).toBe(1);
    expect(pagination.indexEnd).toBe(3);

    await pagination.nextPage();
    expect(pagination.indexStart).toBe(4);
    expect(pagination.indexEnd).toBe(6);
  });

  it('should not allow navigation beyond boundaries', async () => {
    await pagination.fetch({ pageSize: 3 });

    // Try to go previous on first page
    pagination.previousPage();
    expect(pagination.currentPage).toBe(0);

    // Go to last page
    await pagination.nextPage();
    await pagination.nextPage();
    await pagination.nextPage();
    await pagination.nextPage();

    expect(pagination.currentPage).toBe(4);
    expect(pagination.hasNextPage).toBe(false);

    // Try to go next on last page
    await pagination.nextPage();
    expect(pagination.currentPage).toBe(4);
  });

  it('should infer types correctly when using plain TypeScript functions', async () => {
    const plainApiFetch = async (_: TestParams): Promise<TestResponse> => {
      return {
        items: [
          { id: '1', value: 10 },
          { id: '2', value: 20 },
        ],
        nextPageToken: 'next-token',
        total: 2,
      };
    };

    const typedPagination = new ApiPagination({
      onFetch: plainApiFetch,
      itemsKeyname: 'items',
      nextPageKeyname: 'nextPageToken',
      sizeKeyname: 'pageSize',
      pageTokenKeyname: 'pageToken',
      transformFunction: (item) => {
        // Verify item is properly typed as TestItem (not unknown)
        const _typecheck: TestItem = item;
        return {
          ...item,
          transformedId: `plain-${item.id}`,
          doubledValue: item.value * 3,
        };
      },
    });

    await typedPagination.fetch({ pageSize: 2 });

    expect(typedPagination.currentItems).toEqual([
      { id: '1', value: 10, transformedId: 'plain-1', doubledValue: 30 },
      { id: '2', value: 20, transformedId: 'plain-2', doubledValue: 60 },
    ]);
  });
});
