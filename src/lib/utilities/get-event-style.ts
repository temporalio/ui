export const getEventColorHex = (type: string): string => {
  if (type === 'WorkflowTask') return '#22c55e';
  if (type === 'ChildWorkflow') return '#64748b';
  if (type === 'ActivityTask') return '#3b82f6';
  if (type === 'Marker') return '#c084fc';
  if (type === 'Signal') return '#fdba74';
  if (type === 'Timer') return '#fde047';
  return '#e4e4e7';
};
