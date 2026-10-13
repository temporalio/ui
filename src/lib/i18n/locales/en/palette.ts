export const Namespace = 'palette' as const;

// Text for the palette itself. Each tool set owns the text for its own items.
export const Strings = {
  label: 'Command palette',
  'search-placeholder': 'Search…',
  loading: 'Loading…',
  'no-matches': 'No matches',
  empty: 'Nothing here',
  working: 'Working…',
  'still-working': 'Still working on the last action',
  actions: 'Actions',
  'actions-for': 'Actions for {{item}}',
  confirm: 'Confirm',
  cancel: 'Cancel',
  back: 'Back',
  open: 'Open',
  close: 'Close',
  'dev-tools': 'Dev tools',
  all: 'All',
  scope: 'Scope',
  'scope-label': 'Scope: {{scope}}',
  'scoped-to': 'Showing {{scope}}',
  'scope-hint': 'Type a key and a space to scope. Tab cycles scopes.',
  'on-this-page': 'On this page',
  recent: 'Recent',
  'result-count': '{{count}} results',
  'one-result': '1 result',
} as const;
