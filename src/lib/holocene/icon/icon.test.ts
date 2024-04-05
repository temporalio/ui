import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import icons from './icon-names';

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
  test.each(icons)('%s renders', async (iconName) => {
    await import(`./svg/${iconName}.svelte`).then((module) => {
      const Icon = module.default;
      const instance = new Icon({ target });
      expect(instance).toBeTruthy();
      expect(target.innerHTML).toMatchSnapshot();
    });
  });
});
