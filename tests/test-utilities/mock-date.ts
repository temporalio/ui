export const mockDate = () => {
  const _Date = window.Date;

  class FakeDate extends _Date {
    constructor(
      date:
        | number
        | string
        | Date = 'Wed Sept 19 2012 12:00:00 GMT-0600 (Mountain Daylight Time)',
    ) {
      super();
      return new _Date(date);
    }
  }

  window.Date = FakeDate as DateConstructor;
};
