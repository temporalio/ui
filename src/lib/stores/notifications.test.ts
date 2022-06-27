import { afterEach, describe, expect, it } from 'vitest';
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

  describe('clear', () => {
    it('should clear out all of the notifications', () => {
      notifications.add('error', 'This is an error');
      notifications.add('error', 'This is an error');
      notifications.add('error', 'This is an error');

      notifications.clear();

      expect(get(notifications)).toHaveLength(0);
    });
  });

  describe('dismiss', () => {
    it('should remove a notification', () => {
      notifications.add('error', 'This is an error');
      notifications.add('success', 'Everything went well');

      const [notification] = get(notifications);
      const { id } = notification;

      notifications.dismiss(id);

      expect(get(notifications)).toHaveLength(1);
    });

    it('should remove a the correct notification', () => {
      notifications.add('error', 'This is an error');
      notifications.add('success', 'Everything went well');

      const [notification] = get(notifications);
      const { id } = notification;

      notifications.dismiss(id);

      expect(get(notifications)).not.toContain(notification);
    });
  });
});
