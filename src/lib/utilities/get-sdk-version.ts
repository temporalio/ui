import type { WorkflowTaskCompletedEvent } from '$lib/types/events';

import { capitalize } from './format-camel-case';

export const getSDKandVersion = (
  tasks: WorkflowTaskCompletedEvent[],
): { sdk: string; version: string } => {
  let sdk = '';
  let version = '';

  if (!tasks?.length) return { sdk, version };

  tasks.forEach((event) => {
    const sdkMetadata = event?.attributes?.sdkMetadata;
    if (sdkMetadata) {
      const sdkName = sdkMetadata?.sdkName;
      const sdkVersion = sdkMetadata?.sdkVersion;
      if (sdkName) {
        sdk = capitalize(sdkName.split('-')[1]);
        if (sdk === 'Dotnet') {
          sdk = '.NET';
        }
      }
      if (sdkVersion) {
        version = sdkVersion;
      }
    }
  });

  return { sdk, version };
};
