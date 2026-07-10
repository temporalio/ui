import { afterEach, describe, expect, it } from 'vitest';

import { focusTrap, getFocusableElements } from './focus-trap';

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

describe('focusTrap focus management (inert-based)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  // Drawer pattern: node is portaled, created-on-open with enabled=true.
  it('inerts background content while active and clears it on destroy', () => {
    const appRoot = document.createElement('div');
    appRoot.appendChild(document.createElement('button'));
    const portal = document.createElement('div');
    const trapNode = document.createElement('div');
    trapNode.appendChild(document.createElement('button'));
    portal.appendChild(trapNode);
    document.body.append(appRoot, portal);

    const action = focusTrap(trapNode, true);
    expect(appRoot.inert).toBe(true); // background inerted
    expect(portal.inert).toBeFalsy(); // the trap's own branch is not inerted

    action.destroy();
    expect(appRoot.inert).toBe(false); // cleared on close
  });

  it('moves focus into the trap and restores it to the trigger on destroy', () => {
    const trigger = document.createElement('button');
    const trapNode = document.createElement('div');
    const inner = document.createElement('button');
    trapNode.appendChild(inner);
    document.body.append(trigger, trapNode);

    trigger.focus();
    const action = focusTrap(trapNode, true);
    expect(trapNode.contains(document.activeElement)).toBe(true);

    action.destroy();
    expect(document.activeElement).toBe(trigger);
  });

  // Maximizable pattern: node always mounted, enabled toggled via update.
  it('toggles the trap and restores focus via update', () => {
    const trigger = document.createElement('button');
    const wrapper = document.createElement('div');
    const inner = document.createElement('button');
    wrapper.appendChild(inner);
    document.body.append(trigger, wrapper);

    trigger.focus();
    const action = focusTrap(wrapper, false); // mounted disabled
    expect(trigger.inert).toBeFalsy();

    action.update(true);
    expect(trigger.inert).toBe(true);
    expect(wrapper.contains(document.activeElement)).toBe(true);

    action.update(false);
    expect(trigger.inert).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('does not inert a background sibling marked data-inert-skip (hoisted live region)', () => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('data-inert-skip', '');
    const background = document.createElement('div');
    background.appendChild(document.createElement('button'));
    const trapNode = document.createElement('div');
    trapNode.appendChild(document.createElement('button'));
    document.body.append(background, liveRegion, trapNode);

    const action = focusTrap(trapNode, true);
    expect(background.inert).toBe(true); // ordinary background inerted
    expect(liveRegion.inert).toBeFalsy(); // live region skipped → still announces

    action.destroy();
    expect(background.inert).toBe(false);
  });

  it('does not inert a background sibling that is itself an aria-live region', () => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'assertive');
    const trapNode = document.createElement('div');
    trapNode.appendChild(document.createElement('button'));
    document.body.append(liveRegion, trapNode);

    const action = focusTrap(trapNode, true);
    expect(liveRegion.inert).toBeFalsy();

    action.destroy();
  });

  // Containment guard: a container that merely *contains* a live region must
  // still be inerted (the real app shell holds form-error live regions etc.).
  // Skipping it would leave the whole background reachable. Only the live-region
  // root itself is spared, which is why it must be hoisted out first.
  it('still inerts a background container that merely contains a nested live region', () => {
    const shell = document.createElement('div');
    const nestedLive = document.createElement('div');
    nestedLive.setAttribute('aria-live', 'polite');
    shell.append(document.createElement('button'), nestedLive);
    const trapNode = document.createElement('div');
    trapNode.appendChild(document.createElement('button'));
    document.body.append(shell, trapNode);

    const action = focusTrap(trapNode, true);
    expect(shell.inert).toBe(true); // container inerted despite holding a live region

    action.destroy();
    expect(shell.inert).toBe(false);
  });

  it('does not clear inert that was already set before activation', () => {
    const preInert = document.createElement('div');
    preInert.inert = true;
    const trapNode = document.createElement('div');
    trapNode.appendChild(document.createElement('button'));
    document.body.append(preInert, trapNode);

    const action = focusTrap(trapNode, true);
    expect(preInert.inert).toBe(true);

    action.destroy();
    expect(preInert.inert).toBe(true); // we didn't set it, so we must not clear it
  });

  // Overlapping traps: a Maximizable inside a Drawer. The inner trap must not
  // disturb the outer trap's inert state, and tearing the inner down must leave
  // the outer's containment intact.
  it('nests traps without clobbering the outer trap on inner teardown', () => {
    const appRoot = document.createElement('div');
    appRoot.appendChild(document.createElement('button'));

    const outerNode = document.createElement('div'); // drawer
    const outerButton = document.createElement('button');
    const innerNode = document.createElement('div'); // maximizable inside drawer
    innerNode.appendChild(document.createElement('button'));
    outerNode.append(outerButton, innerNode);
    document.body.append(appRoot, outerNode);

    const outer = focusTrap(outerNode, true);
    expect(appRoot.inert).toBe(true); // background inerted by the outer trap

    const inner = focusTrap(innerNode, true);
    expect(outerButton.inert).toBe(true); // inner inerts its siblings within the drawer
    expect(appRoot.inert).toBe(true); // outer's inert is preserved, not re-marked
    expect(innerNode.contains(document.activeElement)).toBe(true);

    inner.destroy();
    expect(outerButton.inert).toBe(false); // inner clears only what it set
    expect(appRoot.inert).toBe(true); // outer trap still contains the background

    outer.destroy();
    expect(appRoot.inert).toBe(false);
  });
});
