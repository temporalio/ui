import type { DescribeNamespaceResponse } from '$lib/types';
import {
  toNamespaceArchivalStateReadable,
  toNamespaceStateReadable,
} from '$lib/utilities/screaming-enums';

export const toNamespaceDetails = (
  namespace: DescribeNamespaceResponse,
): DescribeNamespaceResponse => {
  if (namespace.config) {
    namespace.config.historyArchivalState = toNamespaceArchivalStateReadable(
      namespace.config.historyArchivalState,
    );
    namespace.config.visibilityArchivalState = toNamespaceArchivalStateReadable(
      namespace.config.visibilityArchivalState,
    );
  }

  if (namespace.namespaceInfo) {
    namespace.namespaceInfo.state = toNamespaceStateReadable(
      namespace.namespaceInfo?.state,
    );
  }
  return namespace;
};
