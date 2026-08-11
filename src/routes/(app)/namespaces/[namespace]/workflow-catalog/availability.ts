export const isWorkflowCatalogRouteAvailable = ({
  isDevelopment,
  runtimePolicyAllowsLocalCatalog,
}: {
  isDevelopment: boolean;
  runtimePolicyAllowsLocalCatalog: boolean;
}) => isDevelopment && runtimePolicyAllowsLocalCatalog;
