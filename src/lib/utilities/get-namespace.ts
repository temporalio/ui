import type { DescribeNamespaceResponse } from '$lib/types';

type GetNamespaceParameters = {
  namespace?: string;
  defaultNamespace: string;
  namespaces: DescribeNamespaceResponse[];
};

export const getNamespace = ({
  namespace,
  defaultNamespace,
  namespaces,
}: GetNamespaceParameters): string | undefined => {
  if (!namespace) return defaultNamespace;
  if (!namespaces?.length) return defaultNamespace;

  if (namespaces.find((ns) => ns?.namespaceInfo?.name === namespace)) {
    return namespace;
  }

  return undefined;
};
