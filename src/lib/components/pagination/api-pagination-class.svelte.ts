export const identity = <T>(item: T): T => item;

export type ApiPaginationConfig<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFunc extends (...args: any[]) => Promise<any>,
  TResponse extends Awaited<ReturnType<TFunc>>,
  TItemsKey extends keyof TResponse,
  TNextPageKey extends keyof TResponse,
  TSizeKey extends keyof Parameters<TFunc>[0],
  TPageTokenKey extends keyof Parameters<TFunc>[0],
  TItem = TResponse[TItemsKey] extends readonly (infer U)[] ? U : never,
  TTransformed = TItem,
> = {
  onFetch: TFunc;
  itemsKeyname: TItemsKey;
  nextPageKeyname: TNextPageKey;
  sizeKeyname: TSizeKey;
  pageTokenKeyname: TPageTokenKey;
  pageSizeOptions?: (string | number)[];
  defaultPageSize?: string | number;
  total?: string | number;
  transformFunction?: (item: TItem) => TTransformed;
  onError?: (error: Error | unknown) => void;
  initialFetchParams?: Parameters<TFunc>;
};

export class ApiPagination<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFunc extends (...args: any[]) => Promise<any>,
  TResponse extends Awaited<ReturnType<TFunc>>,
  TItemsKey extends keyof TResponse,
  TNextPageKey extends keyof TResponse,
  TSizeKey extends keyof Parameters<TFunc>[0],
  TPageTokenKey extends keyof Parameters<TFunc>[0],
  TItem = TResponse[TItemsKey] extends readonly (infer U)[] ? U : never,
  TTransformed = TItem,
> {
  // Configuration type - reuses the class generics
  private config: ApiPaginationConfig<
    TFunc,
    TResponse,
    TItemsKey,
    TNextPageKey,
    TSizeKey,
    TPageTokenKey,
    TItem,
    TTransformed
  >;
  // State properties
  #items = $state<TTransformed[]>([]);
  #loading = $state(false);
  #updating = $state(false);
  #error = $state<Error | undefined>(undefined);
  #pageSize = $state<number>(25);
  #currentPage = $state(0);
  #nextPageToken = $state<string | Uint8Array | undefined>(undefined);
  #hasNextPage = $state(false);
  #indexData = $state<
    { items: TTransformed[]; nextToken?: string | Uint8Array }[]
  >([]);

  #lastArgs: Parameters<TFunc> | undefined = undefined;

  constructor(
    config: ApiPaginationConfig<
      TFunc,
      TResponse,
      TItemsKey,
      TNextPageKey,
      TSizeKey,
      TPageTokenKey,
      TItem,
      TTransformed
    >,
  ) {
    // Store the full config with defaults applied
    this.config = {
      pageSizeOptions: [10, 25, 50, 100],
      total: '',
      ...config,
    };

    if (this.config.defaultPageSize) {
      this.#pageSize = Number(this.config.defaultPageSize);
    }

    if (this.config.initialFetchParams) {
      this.fetch(...this.config.initialFetchParams);
    }
  }

  // Getters for reactive state
  get items(): TTransformed[] {
    return this.#items;
  }

  get loading(): boolean {
    return this.#loading;
  }

  get updating(): boolean {
    return this.#updating;
  }

  get error(): Error | undefined {
    return this.#error;
  }

  get pageSize(): number {
    return this.#pageSize;
  }

  get currentPage(): number {
    return this.#currentPage;
  }

  get hasNextPage(): boolean {
    return this.#hasNextPage;
  }

  get hasPreviousPage(): boolean {
    return this.#currentPage > 0;
  }

  get currentItems(): TTransformed[] {
    const currentData = this.#indexData[this.#currentPage];
    return currentData?.items ?? [];
  }
  // TODO: Consider changing currentItems to return TTransformed[] | Error for better error handling
  // This would follow Go-style explicit error handling where errors cannot be ignored:
  // const items = pagination.currentItems;
  // if (items instanceof Error) {
  //     handleError(items);
  //     return;
  // }
  // items.forEach(item => ...) // TypeScript guarantees items is TTransformed[]
  // This prevents bugs where empty states are shown when errors exist, making error handling mandatory

  get indexStart(): number {
    return this.#currentPage * this.#pageSize + 1;
  }

  get indexEnd(): number {
    const start = this.indexStart - 1;
    const currentItems = this.currentItems.length;
    return start + currentItems;
  }

  get isEmpty(): boolean {
    return this.currentItems.length === 0 && !this.#loading;
  }

  get getLastUsedArgs(): Parameters<TFunc> | undefined {
    return this.#lastArgs;
  }

  get pageSizeOptions(): (string | number)[] {
    return this.config.pageSizeOptions || [10, 25, 50, 100];
  }

  // Methods
  async #performFetch(
    args: Parameters<TFunc>,
    pageToken?: string | Uint8Array,
  ): Promise<{
    response: TResponse;
    items: TTransformed[];
    nextPageToken: string | Uint8Array | undefined;
  }> {
    const firstArg = args[0];
    const fetchArgs = { ...firstArg };

    if (this.config.sizeKeyname) {
      fetchArgs[this.config.sizeKeyname] = this.#pageSize;
    }
    if (pageToken) {
      fetchArgs[this.config.pageTokenKeyname] = pageToken;
    }

    const restArgs = args.slice(1);
    const response = await this.config.onFetch(fetchArgs, ...restArgs);

    const nextPageToken = this.#checkNextPageToken(
      response[this.config.nextPageKeyname],
    );
    const rawItems = response[this.config.itemsKeyname];

    // Type guard to ensure rawItems is an array
    if (!Array.isArray(rawItems)) {
      throw new Error(
        `Expected ${String(this.config.itemsKeyname)} to be an array`,
      );
    }

    const items: TTransformed[] = rawItems.map((item) => {
      if (this.config.transformFunction) {
        return this.config.transformFunction(item);
      }
      return item;
    });

    return { response, items, nextPageToken };
  }

  #handleError(err: unknown): void {
    const isError = (e: unknown): e is Error => {
      return (
        e instanceof Error ||
        (e != null && typeof e === 'object' && 'name' in e && 'message' in e)
      );
    };

    if (isError(err)) {
      this.#error = err;
      if (this.config.onError) {
        this.config.onError(err);
      }
    }
  }

  async fetch(...args: Parameters<TFunc>): Promise<TResponse> {
    this.#lastArgs = args;
    this.#error = undefined;
    this.#loading = true;
    this.#updating = false;

    try {
      const { response, items, nextPageToken } = await this.#performFetch(
        args,
        undefined,
      );

      // Reset pagination state and set first page
      this.#indexData = [{ items, nextToken: nextPageToken }];
      this.#currentPage = 0;
      this.#hasNextPage = Boolean(nextPageToken);
      this.#nextPageToken = nextPageToken;

      return response;
    } catch (err) {
      this.#handleError(err);
      throw err;
    } finally {
      this.#loading = false;
    }
  }

  async nextPage(): Promise<void> {
    if (!this.hasNextPage || this.#updating) return;

    // Check if we already have the next page data
    if (this.#indexData[this.#currentPage + 1]) {
      this.#currentPage++;
      this.#hasNextPage = Boolean(
        this.#indexData[this.#currentPage]?.nextToken,
      );
      return;
    }

    // Fetch next page data
    if (!this.#lastArgs) return;

    this.#updating = true;
    this.#error = undefined;

    try {
      const { items, nextPageToken } = await this.#performFetch(
        this.#lastArgs,
        this.#nextPageToken,
      );

      // Add new page data
      this.#indexData.push({ items, nextToken: nextPageToken });
      this.#currentPage++;
      this.#hasNextPage = Boolean(nextPageToken);
      this.#nextPageToken = nextPageToken;
    } catch (err) {
      this.#handleError(err);
    } finally {
      this.#updating = false;
    }
  }

  previousPage(): void {
    if (!this.hasPreviousPage || this.#updating) return;
    this.#currentPage--;
    this.#hasNextPage = true; // We know there's a next page since we went back
  }

  setPageSize(size: number): void {
    if (this.#pageSize === size) return;
    this.#pageSize = size;

    // Refetch with new page size if we have previous args
    if (this.#lastArgs) {
      this.fetch(...this.#lastArgs);
    }
  }

  reset(): void {
    this.#currentPage = 0;
    this.#indexData = [];
    this.#hasNextPage = false;
    this.#nextPageToken = undefined;
    this.#error = undefined;
  }

  clearError(): void {
    this.#error = undefined;
  }

  #checkNextPageToken(token: unknown): string | Uint8Array | undefined {
    if (!token) return undefined;

    if (token instanceof Uint8Array) {
      return token.length === 0 ? undefined : token;
    }

    if (typeof token === 'string') {
      return token;
    }

    // If it's neither string nor Uint8Array, convert to string
    return String(token);
  }
}
