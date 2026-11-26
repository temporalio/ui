export const isCatalogRouteAvailable = ({
  isDevelopment,
  runtimePolicyAllowsLocalCatalog,
}: {
  isDevelopment: boolean;
  runtimePolicyAllowsLocalCatalog: boolean;
}) => isDevelopment && runtimePolicyAllowsLocalCatalog;
