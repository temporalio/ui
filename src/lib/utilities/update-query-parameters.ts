type UpdateQueryParams = {
  parameter: string;
  value: string;
  query: URLSearchParams;
  path: string;
  goto: (href: string, options?: { replaceState: boolean }) => Promise<unknown>;
  invalidate?: (href: string) => Promise<unknown>;
};

export const updateQueryParameters = ({
  parameter,
  value,
  query,
  path,
  goto,
}: UpdateQueryParams): void => {
  if (value) {
    query.set(parameter, value);
  } else {
    query.delete(parameter);
  }
  goto(`${path}?${query}`);
};
