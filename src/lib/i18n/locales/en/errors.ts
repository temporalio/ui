export const Namespace = 'errors' as const;

export const Strings = {
  'bad-request-title': "That request didn't work",
  'bad-request-description':
    "Part of the link or request isn't valid. Check it, or go back.",
  'not-found-title': 'Page not found',
  'not-found-description':
    'The address may be wrong, or the page may have moved.',
  'not-found-resource-title': '{{resource}} not found',
  'not-found-resource-description':
    'It may have been deleted, or the ID or Namespace is wrong.',
  'not-found-unscoped-resource-title': '{{resource}} not found',
  'not-found-unscoped-resource-description':
    'It may have been deleted, or the ID is wrong.',
  'rate-limited-title': 'Namespace rate limit exceeded',
  'rate-limited-description_zero':
    'This Namespace received too many requests. You can try again now.',
  'rate-limited-description_one':
    'This Namespace received too many requests. You can try again in {{count}} second.',
  'rate-limited-description_other':
    'This Namespace received too many requests. You can try again in {{count}} seconds.',
  'server-title': 'Something went wrong on the server',
  'server-description':
    "This isn't something you can fix. Try again, and if it keeps happening, share the technical details with support.",
  'unknown-title': 'Something went wrong',
  'unknown-description':
    'Try again. If it keeps happening, share the technical details with support.',
  'technical-details': 'Technical details',
  'go-back': 'Go back',
  'try-now': 'Try now',
  'try-again': 'Try again',
  'ask-on-slack': 'Ask on Slack',
  'view-namespaces': 'View Namespaces',
} as const;
