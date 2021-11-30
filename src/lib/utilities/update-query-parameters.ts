type UpdateQueryParams = {
  parameter: string;
  value: string;
  query: URLSearchParams;
  path: string;
  goto: (href: string, options?: { replaceState: boolean }) => Promise<any>;
  invalidate?: (href: string) => Promise<any>;
};

export const updateQueryParameters = ({
  parameter,
  value,
  query,
  path,
  goto,
}: UpdateQueryParams) => {
  if (value) {
    query.set(parameter, value);
  } else {
    query.delete(parameter);
  }
  goto(`${path}?${query}`);
};
