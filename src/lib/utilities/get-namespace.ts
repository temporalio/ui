import type { DescribeNamespaceResponse } from '$types';

type GetNamespaceParameters = {
  namespace?: string;
  defaultNamespace: string;
  namespaces: DescribeNamespaceResponse[];
};

export const getNamespace = ({
  namespace,
  defaultNamespace,
  namespaces,
}: GetNamespaceParameters): string => {
  if (
    namespace &&
    namespaces &&
    namespaces.find((ns) => ns.namespaceInfo.name === namespace)
  ) {
    return namespace;
  }

  return defaultNamespace;
};
