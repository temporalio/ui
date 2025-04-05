import { describe, expect, it } from 'vitest';

import { getFocusableElements } from './focus-trap';

describe('getFocusableElements', () => {
  it('should return focusable elements', () => {
    const node = document.createElement('div');

    node.appendChild(document.createElement('button'));
    node.appendChild(document.createElement('input'));
    node.appendChild(document.createElement('textarea'));
    node.appendChild(document.createElement('select'));
    node.appendChild(document.createElement('div'));
    node.appendChild(document.createElement('a'));

    const focusable = getFocusableElements(node);

    expect(focusable.length).toBe(4);
  });

  it('should return elements with an href', () => {
    const node = document.createElement('div');
    const link = document.createElement('a');
    link.setAttribute('href', '#');
    node.appendChild(link);

    const focusable = getFocusableElements(node);

    expect(focusable.length).toBe(1);
  });

  it('should return divs with contentEditable', () => {
    const node = document.createElement('div');
    const editableDiv = document.createElement('div');
    editableDiv.setAttribute('contentEditable', 'true');
    node.appendChild(editableDiv);

    const focusable = getFocusableElements(node);

    expect(focusable.length).toBe(1);
  });

  it('should not return disabled elements', () => {
    const node = document.createElement('div');

    const button = document.createElement('button');
    button.setAttribute('disabled', 'true');
    node.appendChild(button);
    node.appendChild(document.createElement('button'));

    const focusable = getFocusableElements(node);

    expect(focusable.length).toBe(1);
  });

  it('should not return elements with a tabindex of -1', () => {
    const node = document.createElement('div');

    const button = document.createElement('button');
    button.setAttribute('tabindex', '-1');
    node.appendChild(button);
    node.appendChild(document.createElement('button'));

    const focusable = getFocusableElements(node);

    expect(focusable.length).toBe(1);
  });

  it('should return elements with a tabindex of 0', () => {
    const node = document.createElement('ul');
    const listItem = document.createElement('li');
    listItem.setAttribute('tabindex', '0');
    node.appendChild(listItem);
    node.appendChild(document.createElement('li'));

    const focusable = getFocusableElements(node);

    expect(focusable.length).toBe(1);
  });
});
