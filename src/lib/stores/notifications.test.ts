import { get } from 'svelte/store';
import { notifications } from './notifications';

describe('notifications', () => {
  afterEach(() => {
    notifications.clear();
  });

  it('should have a subscribe function', () => {
    expect(notifications.subscribe).toBeDefined();
  });

  it('should start with an empty array', () => {
    expect(get(notifications)).toEqual([]);
  });

  describe('add', () => {
    it('should increase the length by 1', () => {
      notifications.add('error', 'This is an error');
      expect(get(notifications)).toHaveLength(1);
    });

    it('should have the correct data', () => {
      notifications.add('error', 'This is an error');
      const [notification] = get(notifications);

      expect(notification.type).toBe('error');
      expect(notification.message).toBe('This is an error');
    });
  });
});
