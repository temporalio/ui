import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import Button from '$lib/holocene/button.svelte';

let host: HTMLElement;

const variants: ('primary' | 'secondary' | 'destructive' | 'ghost')[] = [
  'primary',
  'secondary',
  'destructive',
  'ghost',
];
const sizes: ('xs' | 'sm' | 'md' | 'lg')[] = ['xs', 'sm', 'md', 'lg'];

beforeEach(() => {
  host = document.createElement('div');
  host.setAttribute('id', 'host');
  document.body.appendChild(host);
});

afterEach(() => {
  host.remove();
});

describe('Button', () => {
  describe.each(variants)('Variant %s renders', (variant) => {
    test.each(sizes)('%s', (size) => {
      const instance = new Button({
        target: host,
        props: { variant, size },
      });

      expect(instance).toBeTruthy();

      expect(host.innerHTML).toMatchSnapshot();
    });

    test('disabled', () => {
      const instance = new Button({
        target: host,
        props: { variant, disabled: true },
      });

      expect(instance).toBeTruthy();

      expect(host.innerHTML).toMatchSnapshot();
    });

    test('count', () => {
      const instance = new Button({
        target: host,
        props: { variant, count: 10 },
      });

      expect(instance).toBeTruthy();

      expect(host.innerHTML).toMatchSnapshot();
    });

    test('loading', () => {
      const instance = new Button({
        target: host,
        props: { variant, loading: true },
      });

      expect(instance).toBeTruthy();

      expect(host.innerHTML).toMatchSnapshot();
    });

    test('leading icon', () => {
      const instance = new Button({
        target: host,
        props: { variant, leadingIcon: 'search' },
      });

      expect(instance).toBeTruthy();

      expect(host.innerHTML).toMatchSnapshot();
    });

    test('trailing icon', () => {
      const instance = new Button({
        target: host,
        props: { variant, trailingIcon: 'search' },
      });

      expect(instance).toBeTruthy();

      expect(host.innerHTML).toMatchSnapshot();
    });
  });
});
