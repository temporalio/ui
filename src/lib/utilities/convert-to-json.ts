export const convertToJSON = (events: Parameters<typeof JSON.stringify>) => {
  const data = JSON.stringify(events);
  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(data);

  return dataUri;
};
