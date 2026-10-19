export const mockNow = () => {
  const _Date = window.Date;

  _Date.now = () => new _Date('2026-10-16T22:13:19.800Z').getTime();
};
