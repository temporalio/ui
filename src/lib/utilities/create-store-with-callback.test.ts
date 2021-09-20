import { createStoreWithCallback } from './create-store-with-callback';

describe(createStoreWithCallback, () => {
  it('should call the callback when a new value is set', () => {
    const fn = jest.fn();
    const store = createStoreWithCallback(0, fn);
    store.set(1);
    expect(fn).toBeCalled();
  });

  it('should call the callback when value is updated', () => {
    const fn = jest.fn();
    const store = createStoreWithCallback(0, fn);
    store.update((count) => count + 1);
    expect(fn).toBeCalled();
  });
});
