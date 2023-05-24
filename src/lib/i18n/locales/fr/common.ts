export const Namespace = 'common' as const;

export const Strings = {
  'recent-workflows': 'Recent Workflows',
  'workflows-count_one': '{{count}} workflow',
  'workflows-count_other': '{{count}} workflows',
  'filtered-workflows-count':
    'Results {{filtered}} of $t(workflows-count, { "count": {{total}} })',
} as const;
