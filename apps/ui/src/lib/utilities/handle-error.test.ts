import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleError } from './handle-error';
import { routeForLoginPage } from './route-for';

const realLocation = window.location.assign;
const fakeLocation = {
  href: 'https://t.io/foo',
  origin: 'https://t.io',
  assign: vi.fn(),
};

describe('handleError', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: fakeLocation });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: realLocation });
    vi.clearAllMocks();
  });

  it('should redirect if it is an unauthorized error with status', () => {
    const error = {
      status: 401,
      statusText: 'Unauthorized',
      response: null as unknown as Response,
    };

    expect(() => handleError(error)).toThrowError();
    expect(window.location.assign).toHaveBeenCalledWith(routeForLoginPage());
  });

  it('should redirect if it is an unauthorized error with statusCode', () => {
    const error = {
      statusCode: 401,
      statusText: 'Unauthorized',
      response: null as unknown as Response,
    };

    expect(() => handleError(error)).toThrowError();
    expect(window.location.assign).toHaveBeenCalledWith(routeForLoginPage());
  });

  it('should redirect if it is a forbidden error with status', () => {
    const error = {
      statusCode: 403,
      statusText: 'Forbidden',
      response: null as unknown as Response,
    };

    expect(() => handleError(error)).toThrowError();
    expect(window.location.assign).toHaveBeenCalledWith(routeForLoginPage());
  });

  it('should redirect if it is a forbidden error with statusCode', () => {
    const error = {
      status: 403,
      statusText: 'Forbidden',
      response: null as unknown as Response,
    };

    expect(() => handleError(error)).toThrowError();
    expect(window.location.assign).toHaveBeenCalledWith(routeForLoginPage());
  });

  it('should not redirect if not 401/403', () => {
    const error = {
      statusText: 'Forbidden',
      response: null as unknown as Response,
    };

    expect(() => handleError(error)).toThrowError();
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('should add toast if it is a NetworkError', () => {
    const error = {
      statusCode: 500,
      statusText: 'Uh oh',
      response: 'lol' as unknown as Response,
    };

    const toasts = {
      push: vi.fn(),
    };

    const errors = {
      set: vi.fn(),
    };

    expect(() => handleError(error, toasts, errors)).toThrowError();
    expect(toasts.push).toHaveBeenCalledWith({
      variant: 'error',
      message: '500 Uh oh',
    });
    expect(errors.set).toHaveBeenCalledWith({ ...error });
  });

  it('should add a toast on a string error', () => {
    const toasts = {
      push: vi.fn(),
    };

    expect(() => handleError(new Error('lol'), toasts)).toThrowError();
    expect(toasts.push).toHaveBeenCalledWith({
      variant: 'error',
      message: 'lol',
    });
  });

  it('should add a toast on an error', () => {
    const toasts = {
      push: vi.fn(),
    };

    expect(() => handleError(new Error('lol'), toasts)).toThrowError();
    expect(toasts.push).toHaveBeenCalledWith({
      variant: 'error',
      message: 'lol',
    });
  });
});
