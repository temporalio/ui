import type { DescribeNamespaceResponse as Namespace } from '$types';

/**
 * Frontend-only namespace filtering based on user attributes
 *
 * @param namespaces - All namespaces from server
 * @param userNamespaces - User's allowed namespaces from JWT claims
 * @returns Filtered namespaces based on user permissions
 */
export function filterNamespacesByUserPermissions(
  namespaces: Namespace[],
  userNamespaces: string | string[] | undefined,
): Namespace[] {
  // If no user namespaces specified, return all namespaces
  if (!userNamespaces) {
    return namespaces;
  }

  // Handle wildcard - if user has "*" access, return all namespaces
  if (
    userNamespaces === '*' ||
    (Array.isArray(userNamespaces) && userNamespaces.includes('*'))
  ) {
    return namespaces;
  }

  // Convert to array if it's a string, handling comma-separated values
  let allowedNamespaces: string[];
  if (Array.isArray(userNamespaces)) {
    allowedNamespaces = userNamespaces;
  } else {
    // Split comma-separated string into array
    allowedNamespaces = userNamespaces.split(',').map((ns) => ns.trim());
  }

  // Filter namespaces based on user's allowed namespaces
  return namespaces.filter((namespace) =>
    allowedNamespaces.includes(namespace.namespaceInfo.name),
  );
}

/**
 * Get allowed namespace names for display
 *
 * @param userNamespaces - User's allowed namespaces from JWT claims
 * @returns Array of allowed namespace names
 */
export function getAllowedNamespaceNames(
  userNamespaces: string | string[] | undefined,
): string[] {
  if (!userNamespaces) {
    return [];
  }

  if (userNamespaces === '*') {
    return ['*']; // Special case for wildcard
  }

  return Array.isArray(userNamespaces) ? userNamespaces : [userNamespaces];
}
