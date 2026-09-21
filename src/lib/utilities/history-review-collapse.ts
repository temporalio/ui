export type ReviewRowScore = {
  score: number;
  pinned?: boolean;
};

export type HiddenRunRow<T = unknown> = {
  kind: 'hidden-run';
  key: string;
  count: number;
  firstId: string;
  lastId: string;
  open: boolean;
  rows: T[];
};

export type CollapseSummary = {
  total: number;
  routine: number;
  visible: number;
};

export type CollapseResult<T> = {
  rows: (T | HiddenRunRow<T>)[];
  routineIds: Set<string>;
  summary: CollapseSummary;
};

export type CollapseOptions<T> = {
  rows: T[];
  getId: (row: T) => string | undefined;
  getScore: (row: T) => ReviewRowScore | undefined;
  threshold: number;
  openKeys: ReadonlySet<string>;
  showAll: boolean;
  /**
   * Where the toggle entry goes relative to the rows of an open run. A view
   * that draws its list bottom-up uses 'after' so the toggle is still on top.
   */
  togglePosition?: 'before' | 'after';
};

export const MIN_HIDDEN_RUN_LENGTH = 2;

export const isHiddenRunRow = <T = unknown>(
  value: unknown,
): value is HiddenRunRow<T> =>
  (value as HiddenRunRow<T>)?.kind === 'hidden-run';

const compareIds = (a: string, b: string): number => {
  const [x, y] = [Number(a), Number(b)];
  if (Number.isFinite(x) && Number.isFinite(y) && x !== y) return x - y;
  return a.localeCompare(b);
};

export const hiddenRunKey = (firstId: string, lastId: string): string => {
  const [low, high] = [firstId, lastId].sort(compareIds);
  return `hidden-run-${low}-${high}`;
};

export const collapseRoutineRows = <T>({
  rows,
  getId,
  getScore,
  threshold,
  openKeys,
  showAll,
  togglePosition = 'before',
}: CollapseOptions<T>): CollapseResult<T> => {
  const isLow = (row: T): boolean => {
    if (getId(row) === undefined) return false;
    const score = getScore(row);
    if (!score || score.pinned) return false;
    return score.score < threshold;
  };

  const result: (T | HiddenRunRow<T>)[] = [];
  const routineIds = new Set<string>();
  let run: T[] = [];

  const flush = () => {
    if (run.length < MIN_HIDDEN_RUN_LENGTH) {
      result.push(...run);
      run = [];
      return;
    }

    const ids = run.map((row) => getId(row) as string);
    ids.forEach((id) => routineIds.add(id));

    if (showAll) {
      result.push(...run);
      run = [];
      return;
    }

    const [firstId, lastId] = [ids[0], ids[ids.length - 1]].sort(compareIds);
    const key = hiddenRunKey(firstId, lastId);
    const open = openKeys.has(key);

    const toggle: HiddenRunRow<T> = {
      kind: 'hidden-run',
      key,
      count: run.length,
      firstId,
      lastId,
      open,
      rows: run,
    };
    const openRows = open ? run : [];
    result.push(
      ...(togglePosition === 'after'
        ? [...openRows, toggle]
        : [toggle, ...openRows]),
    );
    run = [];
  };

  for (const row of rows) {
    if (isLow(row)) {
      run.push(row);
    } else {
      flush();
      result.push(row);
    }
  }
  flush();

  return {
    rows: result,
    routineIds,
    summary: {
      total: rows.length,
      routine: routineIds.size,
      visible: rows.length - routineIds.size,
    },
  };
};
