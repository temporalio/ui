import type { DescribeNamespaceResponse } from '$types';

type GetNamespaceParameters = {
  namespace?: string;
  defaultNamespace: string;
  namespaces: DescribeNamespaceResponse[];
};

type GetDefaultNamespaceParameters = {
  namespaces: DescribeNamespaceResponse[];
  settings: Settings;
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

export const getDefaultNamespace = ({
  namespaces,
  settings,
}: GetDefaultNamespaceParameters): string => {
  const { showTemporalSystemNamespace, defaultNamespace } = settings;

  const namespaceNames = (namespaces || [])
    .map(
      (namespace: DescribeNamespaceResponse) => namespace?.namespaceInfo?.name,
    )
    .filter(
      (namespace: string) =>
        showTemporalSystemNamespace || namespace !== 'temporal-system',
    );

  return (
    namespaceNames.find((ns) => ns === defaultNamespace) ??
    namespaceNames[0] ??
    defaultNamespace
  );
};
