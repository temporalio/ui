/**
 * Columnar row store.
 *
 * An array of 12M row objects is ~6.7 GB and OOMs a tab. The same data as one
 * typed array per field is ~560 MB, so the shape of the store is what decides
 * whether an uncapped snapshot is possible at all.
 *
 * Strings are the expensive part: 12M workflow + run IDs as live JS strings
 * measure ~2.6 GB. They are packed into flat byte buffers instead and
 * materialised only for the rows actually on screen.
 */

export const ID_WIDTH = 32; // bytes per packed workflow ID
export const RUN_WIDTH = 36; // bytes per packed run ID

export type SandboxColumns = {
  capacity: number;
  count: number;
  status: Uint8Array;
  type: Uint8Array;
  queue: Uint8Array;
  start: Float64Array;
  end: Float64Array;
  workflowId: Uint8Array;
  runId: Uint8Array;
  statusNames: string[];
  typeNames: string[];
  queueNames: string[];
};

export type DisplayRow = {
  status: string;
  workflowId: string;
  runId: string;
  type: string;
  startTime: number;
  endTime: number | null;
  taskQueue: string;
};

export const allocate = (capacity: number): SandboxColumns => ({
  capacity,
  count: 0,
  status: new Uint8Array(capacity),
  type: new Uint8Array(capacity),
  queue: new Uint8Array(capacity),
  start: new Float64Array(capacity),
  end: new Float64Array(capacity),
  workflowId: new Uint8Array(capacity * ID_WIDTH),
  runId: new Uint8Array(capacity * RUN_WIDTH),
  statusNames: [],
  typeNames: [],
  queueNames: [],
});

export const bytesUsed = (columns: SandboxColumns): number =>
  columns.status.byteLength +
  columns.type.byteLength +
  columns.queue.byteLength +
  columns.start.byteLength +
  columns.end.byteLength +
  columns.workflowId.byteLength +
  columns.runId.byteLength;

const decoder = new TextDecoder();

const readPacked = (bytes: Uint8Array, row: number, width: number): string => {
  const base = row * width;
  let length = width;
  while (length > 0 && bytes[base + length - 1] === 0) length--;
  return decoder.decode(bytes.subarray(base, base + length));
};

export const writePacked = (
  bytes: Uint8Array,
  row: number,
  width: number,
  value: string,
): void => {
  const base = row * width;
  const limit = Math.min(value.length, width);
  for (let i = 0; i < limit; i++) bytes[base + i] = value.charCodeAt(i) & 0xff;
  for (let i = limit; i < width; i++) bytes[base + i] = 0;
};

/** Build a display object for one row. Called only for on-screen rows. */
export const materialize = (
  columns: SandboxColumns,
  row: number,
): DisplayRow => ({
  status: columns.statusNames[columns.status[row]] ?? 'Unspecified',
  workflowId: readPacked(columns.workflowId, row, ID_WIDTH),
  runId: readPacked(columns.runId, row, RUN_WIDTH),
  type: columns.typeNames[columns.type[row]] ?? '',
  startTime: columns.start[row],
  endTime: columns.end[row] === 0 ? null : columns.end[row],
  taskQueue: columns.queueNames[columns.queue[row]] ?? '',
});

/** Dictionary-encode a value, appending to the dictionary on first sight. */
export const intern = (dictionary: string[], value: string): number => {
  const existing = dictionary.indexOf(value);
  if (existing !== -1) return existing;
  dictionary.push(value);
  return dictionary.length - 1;
};
