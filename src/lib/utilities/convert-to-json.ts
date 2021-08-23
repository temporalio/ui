export const convertToJSON = (events) => {
  const eventsString = JSON.stringify(events);
  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(eventsString);

  return dataUri;
};
