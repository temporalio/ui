const featureLabels: Readonly<Record<string, string>> = {
  activities: 'Activities',
  'child-workflows': 'Child Workflows',
  concurrency: 'Concurrency',
  'event-groups': 'Event Groups',
  'event-history': 'Event History',
  heartbeats: 'Heartbeats',
  'local-activities': 'Local Activities',
  'long-running': 'Long-running',
  nexus: 'Nexus',
  patching: 'Patching',
  'priority-fairness': 'Priority and Fairness',
  queries: 'Queries',
  retries: 'Retries',
  sequencing: 'Sequencing',
  signals: 'Signals',
  standalone: 'Standalone',
  'terminal-outcome': 'Terminal outcome',
  timeouts: 'Timeouts',
  timers: 'Timers',
  updates: 'Updates',
  versioning: 'Versioning',
};

const sentenceCase = (slug: string) => {
  const words = slug.replaceAll('-', ' ').trim();
  return words.charAt(0).toLocaleUpperCase() + words.slice(1);
};

export const featureLabel = (feature: string): string =>
  Object.hasOwn(featureLabels, feature)
    ? featureLabels[feature]
    : sentenceCase(feature);
