import { getQueryTypesFromError } from './get-query-types-from-error';

const error = {
  code: 3,
  message:
    'unknown queryType @@temporal-internal__list. KnownQueryTypes=[__stack_trace __open_sessions]',
  details: [
    {
      typeUrl:
        'type.googleapis.com/temporal.api.errordetails.v1.QueryFailedFailure',
      value: null,
    },
  ],
};

describe(getQueryTypesFromError, () => {
  it('should return an array of query types', () => {
    const queryTypes = ['__open_sessions'];
    expect(getQueryTypesFromError(error.message)).toEqual(queryTypes);
  });

  it('should omit __stack_traces', () => {
    expect(getQueryTypesFromError(error.message)).not.toContain(
      '__stack_trace',
    );
  });
});
