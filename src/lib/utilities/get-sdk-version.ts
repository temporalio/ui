import { capitalize } from './format-camel-case';

type SDKTask = {
  attributes?: {
    sdkMetadata?: {
      sdkName?: string | null;
      sdkVersion?: string | null;
    } | null;
  } | null;
};

export const formatSDKName = (sdkName: string | undefined | null): string => {
  let sdk = '';
  if (!sdkName) return sdk;

  const parts = sdkName.split('-');
  sdk = capitalize(parts[1] ?? parts[0]);
  if (sdk === 'Dotnet') {
    sdk = '.NET';
  }

  return sdk;
};

export const getSDKandVersion = (
  tasks: SDKTask[],
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
        sdk = formatSDKName(sdkName);
      }
      if (sdkVersion) {
        version = sdkVersion;
      }
    }
  });

  return { sdk, version };
};
