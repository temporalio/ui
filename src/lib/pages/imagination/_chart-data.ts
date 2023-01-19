export interface StatusSeries {
  label: string;
  id: string;
  color: string;
  backgroundColor?: string;
  data: number[];
}


const getTotalUsage = (stats: NamespaceUsageStats[]): UsageSeries[] => [
  {
    label: 'Activities',
    id: 'activity',
    color: '#8B5CF6',
    backgroundColor: '#FAF5FF',
    data: stats.map((s) => s.Activity)
  },
  {
    label: 'Queries',
    id: 'query',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    data: stats.map((s) => s.Query)
  },
  {
    label: 'Signals',
    id: 'signal',
    color: '#F59E0B',
    backgroundColor: '#FEFCE8',
    data: stats.map((s) => s.Signal)
  },
  {
    label: 'Timers',
    id: 'timer',
    color: '#EC4899',
    backgroundColor: '#FDF2F8',
    data: stats.map((s) => s.Timer)
  },
  {
    label: 'Workflows',
    id: 'workflow',
    color: '#10B981',
    backgroundColor: '#F0FDF4',
    data: stats.map((s) => s.Workflow)
  }
];


