import type { FlattenedSceneRow } from './types';

/** Child workflows start collapsed; manual overrides are keyed by scene header. */
export function isSceneRowCollapsed(
  row: FlattenedSceneRow,
  collapsedKeys: ReadonlySet<string>,
  openedChildKeys: ReadonlySet<string>,
): boolean {
  if (row.kind === 'event') return false;
  if (row.kind === 'workflow' && row.depth > 0) {
    return !openedChildKeys.has(row.key);
  }
  return collapsedKeys.has(row.key);
}

/** Hides descendants of collapsed workflows and runs while keeping their headers. */
export function collapseSceneRows(
  rows: readonly FlattenedSceneRow[],
  collapsedKeys: ReadonlySet<string>,
  openedChildKeys: ReadonlySet<string>,
): readonly FlattenedSceneRow[] {
  const displayed: FlattenedSceneRow[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    displayed.push(row);
    if (!isSceneRowCollapsed(row, collapsedKeys, openedChildKeys)) continue;

    while (index + 1 < rows.length && rows[index + 1].depth > row.depth) {
      index++;
    }
  }

  return displayed;
}
