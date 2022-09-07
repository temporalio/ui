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

  it('should redirect if it is an unauthorized error', () => {
    const error = {
      statusCode: 401,
      statusText: 'Unauthorized',
      response: null as unknown as Response,
    };

    handleError(error);

    expect(window.location.assign).toHaveBeenCalledWith(routeForLoginPage());
  });

  it('should redirect if it is an forbidden error', () => {
    const error = {
      statusCode: 403,
      statusText: 'Forbidden',
      response: null as unknown as Response,
    };

    handleError(error);

    expect(window.location.assign).toHaveBeenCalledWith(routeForLoginPage());
  });

  it('should add notification if it is a NetworkError', () => {
    const error = {
      statusCode: 500,
      statusText: 'Uh oh',
      response: 'lol' as unknown as Response,
    };

    const notifications = {
      add: vi.fn(),
    };

    const errors = {
      set: vi.fn(),
    };

    try {
      handleError(error, notifications, errors);
    } catch (error) {
      expect(notifications.add).toHaveBeenCalledWith('error', '500 Uh oh');
      expect(errors.set).toHaveBeenCalledWith({ ...error });
    }
  });

  it('should add a notification on a string error', () => {
    const notifications = {
      add: vi.fn(),
    };

    handleError('lol', notifications);
    expect(notifications.add).toHaveBeenCalledWith('error', 'lol');
  });

  it('should add a notification on an error', () => {
    const notifications = {
      add: vi.fn(),
    };

    handleError(new Error('lol'), notifications);
    expect(notifications.add).toHaveBeenCalledWith('error', 'lol');
  });
});
