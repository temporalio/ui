export const getEventColorHex = (type: string): string => {
  if (type === 'ActivityTask') return '#8B5CF6';
  if (type === 'Marker') return '#EC4899';
  if (type === 'ChildWorkflow') return '#F59E0B';
  if (type === 'Signal') return '#DD6B20';
  if (type === 'Timer') return '#1D4ED8';
  if (type === 'WorkflowTask') return '#10B981';
  return '#e4e4e7';
};
