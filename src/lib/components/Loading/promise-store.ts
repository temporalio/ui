export default async (promise, subscriber) => {
  subscriber(true);
  try {
    await promise;
  } catch (err) {}
  subscriber(false);
};
