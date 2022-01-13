export const createDataUrl = (
  events: Parameters<typeof JSON.stringify>[0],
): string => {
  const data = JSON.stringify(events);
  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(data);

  return dataUri;
};
