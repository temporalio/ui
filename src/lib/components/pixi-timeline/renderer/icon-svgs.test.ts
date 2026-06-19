import { describe, expect, it } from 'vitest';

import {
  buildIconSvg,
  getEventIconSvg,
  PIXI_TYPE_TO_ICON,
  type PixiIconName,
} from './icon-svgs';

describe('PIXI_TYPE_TO_ICON mapping', () => {
  const expectedMappings: [string, PixiIconName][] = [
    ['GROUP_ACTIVITY', 'activity'],
    ['GROUP_CHILD_WORKFLOW', 'relationship'],
    ['GROUP_TIMER', 'retention'],
    ['GROUP_WORKFLOW_TASK', 'terminal'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_STARTED', 'workflow'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED', 'workflow'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_FAILED', 'workflow'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED', 'workflow'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT', 'workflow'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED', 'workflow'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW', 'workflow'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED', 'signal'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED', 'update'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_COMPLETED', 'update'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_REQUESTED', 'update'],
    ['EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_REJECTED', 'update'],
    ['EVENT_TYPE_NEXUS_OPERATION_SCHEDULED', 'nexus'],
    ['EVENT_TYPE_NEXUS_OPERATION_STARTED', 'nexus'],
    ['EVENT_TYPE_NEXUS_OPERATION_COMPLETED', 'nexus'],
    ['EVENT_TYPE_NEXUS_OPERATION_FAILED', 'nexus'],
    ['EVENT_TYPE_NEXUS_OPERATION_CANCELED', 'nexus'],
    ['EVENT_TYPE_NEXUS_OPERATION_TIMED_OUT', 'nexus'],
  ];

  it.each(expectedMappings)('maps %s → %s', (eventType, expectedIcon) => {
    expect(PIXI_TYPE_TO_ICON[eventType]).toBe(expectedIcon);
  });

  it('returns undefined for unmapped event types', () => {
    expect(PIXI_TYPE_TO_ICON['EVENT_TYPE_MARKER_RECORDED']).toBeUndefined();
    expect(PIXI_TYPE_TO_ICON['UNKNOWN_TYPE']).toBeUndefined();
    expect(PIXI_TYPE_TO_ICON['']).toBeUndefined();
  });
});

describe('buildIconSvg', () => {
  const allIconNames: PixiIconName[] = [
    'activity',
    'feather',
    'nexus',
    'relationship',
    'retention',
    'signal',
    'terminal',
    'update',
    'workflow',
  ];

  it.each(allIconNames)('produces valid SVG wrapper for %s', (name) => {
    const svg = buildIconSvg(name);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toMatch(/<\/svg>$/);
    expect(svg).toContain('viewBox="0 0 24 24"');
  });

  it('uses currentColor fill for CSS color inheritance', () => {
    for (const name of allIconNames) {
      const svg = buildIconSvg(name);
      expect(svg).toContain('fill="currentColor"');
      expect(svg).not.toContain('fill="#ffffff"');
      expect(svg).not.toContain('fill="#000000"');
    }
  });

  it('signal icon includes both a path and a circle element', () => {
    const svg = buildIconSvg('signal');
    expect(svg).toContain('<path ');
    expect(svg).toContain('<circle ');
  });

  it('non-circle icons contain only path elements', () => {
    const iconsWithoutCircles: PixiIconName[] = [
      'activity',
      'feather',
      'nexus',
      'relationship',
      'retention',
      'terminal',
      'update',
      'workflow',
    ];
    for (const name of iconsWithoutCircles) {
      const svg = buildIconSvg(name);
      expect(svg).not.toContain('<circle ');
    }
  });
});

describe('getEventIconSvg', () => {
  it('returns non-null SVG for all mapped event types', () => {
    const mappedTypes = Object.keys(PIXI_TYPE_TO_ICON);
    for (const eventType of mappedTypes) {
      const svg = getEventIconSvg(eventType);
      expect(svg).not.toBeNull();
      expect(svg).toMatch(/^<svg /);
    }
  });

  it('returns null for unmapped event types', () => {
    expect(getEventIconSvg('EVENT_TYPE_MARKER_RECORDED')).toBeNull();
    expect(getEventIconSvg('GROUP_WORKFLOW_EXECUTION')).toBeNull();
    expect(getEventIconSvg('')).toBeNull();
    expect(getEventIconSvg('UNKNOWN')).toBeNull();
  });

  it('GROUP_ACTIVITY returns the activity diamond SVG', () => {
    const svg = getEventIconSvg('GROUP_ACTIVITY');
    expect(svg).not.toBeNull();
    // Activity icon path data starts with the diamond shape
    expect(svg).toContain('M10.4543');
  });

  it('GROUP_TIMER returns the retention (clock) SVG', () => {
    const svg = getEventIconSvg('GROUP_TIMER');
    expect(svg).not.toBeNull();
    expect(svg).toContain('M8.25 0H15.75');
  });

  it('GROUP_CHILD_WORKFLOW returns the relationship (tree) SVG', () => {
    const svg = getEventIconSvg('GROUP_CHILD_WORKFLOW');
    expect(svg).not.toBeNull();
    expect(svg).toContain('M8.55523 0H15.4441');
  });

  it('workflow execution events all return the same workflow SVG', () => {
    const workflowTypes = [
      'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_FAILED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT',
      'EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW',
    ];
    const svgs = workflowTypes.map((t) => getEventIconSvg(t));
    const first = svgs[0];
    for (const svg of svgs) expect(svg).toBe(first);
  });

  it('update event variants all return the same update SVG', () => {
    const updateTypes = [
      'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_COMPLETED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_REQUESTED',
      'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_REJECTED',
    ];
    const svgs = updateTypes.map((t) => getEventIconSvg(t));
    const first = svgs[0];
    for (const svg of svgs) expect(svg).toBe(first);
  });
});
