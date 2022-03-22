import { updateQueryParameters } from './update-query-parameters';

const gotoOptions = { replaceState: true, keepfocus: true, noscroll: true };
const url = new URL('https://temporal.io');

describe(updateQueryParameters, () => {
  it('should call the set method on the query when a value is provided', () => {
    const parameter = 'parameter';
    const value = 'value';
    const goto = () => Promise.resolve();

    const spy = jest.spyOn(url.searchParams, 'set');

    updateQueryParameters({ parameter, value, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter, value);
  });

  it('should call the delete method on the query when no value is provided', () => {
    const parameter = 'parameter';
    const goto = () => Promise.resolve();

    const spy = jest.spyOn(url.searchParams, 'delete');

    updateQueryParameters({ parameter, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call the delete method on the query when an empty string is provided', () => {
    const parameter = 'parameter';
    const value = '';
    const goto = () => Promise.resolve();

    const spy = jest.spyOn(url.searchParams, 'delete');

    updateQueryParameters({ parameter, value, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call the delete method on the query when null is provided', () => {
    const parameter = 'parameter';
    const value = null;
    const goto = () => Promise.resolve();

    const spy = jest.spyOn(url.searchParams, 'delete');

    updateQueryParameters({ parameter, value, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call `goto` with the correct path', () => {
    const parameter = 'parameter';
    const value = 'value';
    const goto = jest.fn().mockReturnValue(Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    expect(goto).toHaveBeenCalledWith(url.toString(), gotoOptions);
  });

  it('should call `goto` with the correct path when query paramters already exist', () => {
    const parameter = 'parameter';
    const value = 'newvalue';
    const goto = jest.fn().mockReturnValue(Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    expect(goto).toHaveBeenCalledWith(
      'https://temporal.io/?parameter=newvalue',
      gotoOptions,
    );
  });

  it('should call `goto` with without the "?" if the query params are empty', () => {
    const parameter = 'parameter';
    const value = null;
    const query = new URLSearchParams();
    const path = '/some/path';
    const goto = jest.fn().mockReturnValue(Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    expect(goto).toHaveBeenCalledWith('https://temporal.io/', gotoOptions);
  });
});
