export const createDataUrl = (
  events: Parameters<typeof JSON.stringify>[0],
): string => {
  const data = JSON.stringify(events, undefined, 2);
  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(data);

  return dataUri;
};
