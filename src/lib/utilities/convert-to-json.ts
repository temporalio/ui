export const convertToJSON = (events: any) => {
  const data = JSON.stringify(events);
  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(data);

  return dataUri;
};
