import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import Button from '$lib/holocene/button.svelte';

let host: HTMLElement;

beforeEach(() => {
  host = document.createElement('div');
  host.setAttribute('id', 'host');
  document.body.appendChild(host);
});

afterEach(() => {
  host.remove();
});

describe('Button', () => {
  test('default', async () => {
    const instance = new Button({ target: host, props: {} });

    expect(instance).toBeTruthy();

    expect(host.innerHTML).toMatchSnapshot();
  });

  test('disabled', async () => {
    const instance = new Button({
      target: host,
      props: {
        disabled: true,
      },
    });

    expect(instance).toBeTruthy();

    expect(host.innerHTML).toMatchSnapshot();
  });

  test('secondary', async () => {
    const instance = new Button({
      target: host,
      props: {
        secondary: true,
      },
    });

    expect(instance).toBeTruthy();

    expect(host.innerHTML).toMatchSnapshot();
  });

  test('secondary disabled', async () => {
    const instance = new Button({
      target: host,
      props: {
        secondary: true,
      },
    });

    expect(instance).toBeTruthy();

    expect(host.innerHTML).toMatchSnapshot();
  });

  test('loading', async () => {
    const instance = new Button({
      target: host,
      props: {
        loading: true,
      },
    });

    expect(instance).toBeTruthy();

    expect(host.innerHTML).toMatchSnapshot();
  });

  test('icon', async () => {
    const instance = new Button({
      target: host,
      props: {
        icon: 'download',
      },
    });

    expect(instance).toBeTruthy();

    expect(host.innerHTML).toMatchSnapshot();
  });
});
