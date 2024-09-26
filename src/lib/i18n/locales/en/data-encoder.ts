export const Namespace = 'data-encoder' as const;

export const Strings = {
  'codec-server': 'Codec Server',
  'endpoint-title': 'Codec Server browser endpoint',
  'endpoint-description':
    'Enter a Codec Server endpoint for this browser. This will be stored in your browser and will only be accessible by you.',
  'endpoint-placeholder': 'Paste your endpoint here',
  'pass-access-token-label': 'Pass the user access token',
  'include-cross-origin-credentials-label': 'Include cross-origin credentials',
  'include-cross-origin-credentials-warning':
    'Warning: Pre-flight checks will be done and could result in failure to decode if incorrectly configured.',
  'port-title': 'tctl plugin port ',
  'port-info': 'If both are set, the Codec Server endpoint will be used.',
  'access-token-https-error':
    'Endpoint must be https:// if passing access token',
  'prefix-error': 'Endpoint must start with http:// or https://',
  'codec-server-description-prefix': 'A ',
  'codec-server-description-suffix':
    ' decodes your data. A Codec Server endpoint can be set at the {{level}} level, or locally in your browser.',
  'browser-override-description':
    'Use my browser setting and ignore {{level}}-level setting.',
  'no-browser-override-description':
    'Use {{level}}-level setting, where available.',
  'codec-server-configured': 'Codec Server is configured',
  'codec-server-error': 'Codec Server could not connect',
  'codec-server-success': 'Codec Server succesfully converted content',
  'configure-codec-server': 'Configure Codec Server',
  'encode-error': 'Codec Server failed to encode',
} as const;
