export const Namespace = 'workers' as const;

export const Strings = {
  workers: 'Workers',
  version: 'Version',
  retirability: 'Retirability',
  buildId: 'Build ID',
  'assignment-rules': 'Assignment Rules',
  'redirect-rules': 'Redirect Rules',
  default: 'Default',
  overall: 'Overall',
  'compatible-build-ids': 'Compatible Build IDs',
  'version-sets': 'Version Sets',
  'no-version-sets-found': 'No Version Sets found',
  'no-assignment-rules-found': 'No Assignment Rules found',
  'no-redirect-rules-found': 'No Redirect Rules found',
  'last-used-version': 'Last used version',
  'next-version': 'Next version',
  'ready-to-be-retired': 'Ready to be Retired',
  'max-version-sets-title': 'Limit reached for Compatible Version Sets',
  'max-version-sets-description':
    'You can increase the number of Compatible Version sets via the limit.versionCompatibleSetsPerQueue dynamic config property.',
} as const;
