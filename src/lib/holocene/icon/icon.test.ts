import { icons } from './paths';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
let target: HTMLElement;

beforeEach(() => {
  target = document.createElement('div');
  target.setAttribute('id', 'target');
  document.body.appendChild(target);
});

afterEach(() => {
  target.remove();
});

describe.each(Object.keys(icons))('$iconName Icon', (iconName) => {
  test(`${iconName} renders`, () => {
    const Icon = icons[iconName];
    const instance = new Icon({ target });
    expect(instance).toBeTruthy();
    expect(target.innerHTML).toMatchSnapshot();
  });
});
