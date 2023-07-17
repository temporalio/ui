import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { icons } from './paths';
let target: HTMLElement;

beforeEach(() => {
  target = document.createElement('div');
  target.setAttribute('id', 'target');
  document.body.appendChild(target);
});

afterEach(() => {
  target.remove();
});

describe('Icon', () => {
  test.each(Object.keys(icons))('%s renders', (iconName) => {
    const Icon = icons[iconName];
    const instance = new Icon({ target });
    expect(instance).toBeTruthy();
    expect(target.innerHTML).toMatchSnapshot();
  });
});
