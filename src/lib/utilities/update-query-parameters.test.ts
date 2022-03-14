import { updateQueryParameters } from './update-query-parameters';

const gotoOptions = { replaceState: true, keepfocus: true, noscroll: true };

describe(updateQueryParameters, () => {
  it('should call the set method on the query when a value is provided', () => {
    const parameter = 'parameter';
    const value = 'value';
    const query = new URLSearchParams();
    const path = '/some/path';
    const goto = () => Promise.resolve(true);

    const spy = jest.spyOn(query, 'set');

    updateQueryParameters({ parameter, value, query, path, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter, value);
  });

  it('should call the delete method on the query when no value is provided', () => {
    const parameter = 'parameter';
    const query = new URLSearchParams();
    const path = '/some/path';
    const goto = () => Promise.resolve(true);

    const spy = jest.spyOn(query, 'delete');

    updateQueryParameters({ parameter, query, path, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call the delete method on the query when an empty string is provided', () => {
    const parameter = 'parameter';
    const value = '';
    const query = new URLSearchParams();
    const path = '/some/path';
    const goto = () => Promise.resolve(true);

    const spy = jest.spyOn(query, 'delete');

    updateQueryParameters({ parameter, value, query, path, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call the delete method on the query when null is provided', () => {
    const parameter = 'parameter';
    const value = null;
    const query = new URLSearchParams();
    const path = '/some/path';
    const goto = () => Promise.resolve(true);

    const spy = jest.spyOn(query, 'delete');

    updateQueryParameters({ parameter, value, query, path, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call `goto` with the correct path', () => {
    const parameter = 'parameter';
    const value = 'value';
    const query = new URLSearchParams();
    const path = '/some/path';
    const goto = jest.fn().mockReturnValue(Promise.resolve(null));

    updateQueryParameters({ parameter, value, query, path, goto });

    expect(goto).toHaveBeenCalledWith(
      '/some/path?parameter=value',
      gotoOptions,
    );
  });

  it('should call `goto` with the correct path when query paramters already exist', () => {
    const parameter = 'parameter';
    const value = 'value';
    const query = new URLSearchParams({ otherParameter: 'otherValue' });
    const path = '/some/path';
    const goto = jest.fn().mockReturnValue(Promise.resolve(null));

    updateQueryParameters({ parameter, value, query, path, goto });

    expect(goto).toHaveBeenCalledWith(
      '/some/path?otherParameter=otherValue&parameter=value',
      gotoOptions,
    );
  });

  it('should call `goto` with without the "?" if the query params are empty', () => {
    const parameter = 'parameter';
    const value = null;
    const query = new URLSearchParams();
    const path = '/some/path';
    const goto = jest.fn().mockReturnValue(Promise.resolve(null));

    updateQueryParameters({ parameter, value, query, path, goto });

    expect(goto).toHaveBeenCalledWith('/some/path', gotoOptions);
  });
});
