export const Namespace = 'errors' as const;

export const Strings = {
  'bad-request-title': "That request didn't work",
  'bad-request-description':
    "Part of the link or request isn't valid. Check it, or go back.",
  'forbidden-title': "You don't have access",
  'forbidden-description':
    'Ask an administrator for access, or switch to another Namespace.',
  'not-found-title': 'Page not found',
  'not-found-description':
    'The address may be wrong, or the page may have moved.',
  'not-found-resource-title': '{{resource}} not found',
  'not-found-resource-description':
    'It may have been deleted, or the ID or Namespace is wrong.',
  'not-found-unscoped-resource-title': '{{resource}} not found',
  'not-found-unscoped-resource-description':
    'It may have been deleted, or the ID is wrong.',
  'rate-limited-title': 'Too many requests',
  'rate-limited-description': 'Wait a moment, then try again.',
  'not-implemented-title': 'Not supported',
  'not-implemented-description':
    "This Temporal server version doesn't support this feature.",
  'unavailable-title': "The Temporal server isn't responding",
  'unavailable-description':
    'It may be restarting or overloaded. Try again in a moment.',
  'server-title': 'The server ran into a problem',
  'server-description':
    'Try again. If it keeps happening, share the technical details with support.',
  'unknown-title': 'Something went wrong',
  'unknown-description':
    'Try again. If it keeps happening, share the technical details with support.',
  'technical-details': 'Technical details',
  'go-back': 'Go back',
  'ask-on-slack': 'Ask on Slack',
  'view-namespaces': 'View Namespaces',
} as const;
