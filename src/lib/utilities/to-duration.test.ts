import { toDuration } from './to-duration';

describe(toDuration, () => {
  it('should correctly parse "Last 10 minutes"', () => {
    expect(toDuration('Last 10 minutes')).toEqual({ minutes: 10 });
  });

  it('should correctly parse "Last 60 minutes"', () => {
    expect(toDuration('Last 60 minutes')).toEqual({ minutes: 60 });
  });

  it('should correctly parse "Last 3 hours"', () => {
    expect(toDuration('Last 3 hours')).toEqual({ hours: 3 });
  });

  it('should correctly parse "Last 24 hours"', () => {
    expect(toDuration('Last 24 hours')).toEqual({ hours: 24 });
  });

  it('should correctly parse "Last 3 days"', () => {
    expect(toDuration('Last 3 days')).toEqual({ days: 3 });
  });

  it('should correctly parse "Last 7 days"', () => {
    expect(toDuration('Last 7 days')).toEqual({ days: 7 });
  });

  it('should correctly parse "Last 30 days"', () => {
    expect(toDuration('Last 30 days')).toEqual({ days: 30 });
  });

  it('should correctly parse "Last 3 months"', () => {
    expect(toDuration('Last 3 months')).toEqual({ months: 3 });
  });

  it('should correctly parse "10 minutes"', () => {
    expect(toDuration('10 minutes')).toEqual({ minutes: 10 });
  });

  it('should correctly parse "60 minutes"', () => {
    expect(toDuration('60 minutes')).toEqual({ minutes: 60 });
  });

  it('should correctly parse "3 hours"', () => {
    expect(toDuration('3 hours')).toEqual({ hours: 3 });
  });

  it('should correctly parse "24 hours"', () => {
    expect(toDuration('24 hours')).toEqual({ hours: 24 });
  });

  it('should correctly parse "3 days"', () => {
    expect(toDuration('3 days')).toEqual({ days: 3 });
  });

  it('should correctly parse "7 days"', () => {
    expect(toDuration('7 days')).toEqual({ days: 7 });
  });

  it('should correctly parse "30 days"', () => {
    expect(toDuration('30 days')).toEqual({ days: 30 });
  });

  it('should correctly parse "3 months"', () => {
    expect(toDuration('3 months')).toEqual({ months: 3 });
  });
});
