import UrlPattern from 'url-pattern';

// The default for this lib doesn't include .-_ which are all valid characters for a cloud namespace
const urlPatternOpts = { segmentValueCharset: '.a-zA-Z0-9_-' };

export const namespaceUrlPattern = new UrlPattern(
  '/namespaces/:namespace/*',
  urlPatternOpts,
);
