export const KEYBOARD_RESIZE_STEP = 16;

export type ColumnResizeAction =
  | { type: 'resize'; width: number }
  | { type: 'reset' }
  | { type: 'ignore' };

export const clampColumnWidth = (value: number, min: number) =>
  Math.max(min, Math.round(value));

export const columnResizeActionForKey = (
  key: string,
  currentWidth: number,
  min: number,
): ColumnResizeAction => {
  if (key === 'ArrowLeft') {
    return {
      type: 'resize',
      width: clampColumnWidth(currentWidth - KEYBOARD_RESIZE_STEP, min),
    };
  }

  if (key === 'ArrowRight') {
    return {
      type: 'resize',
      width: clampColumnWidth(currentWidth + KEYBOARD_RESIZE_STEP, min),
    };
  }

  if (key === 'Enter' || key === ' ') {
    return { type: 'reset' };
  }

  return { type: 'ignore' };
};

export const columnWidthStyle = (width: number | undefined) =>
  width === undefined
    ? undefined
    : `width: ${width}px; min-width: ${width}px; max-width: ${width}px`;

export const COLUMN_WIDTH_CLAMP_CLASSES =
  'overflow-hidden text-ellipsis [&_.wrapper]:block [&_.wrapper]:max-w-full [&_.wrapper]:overflow-hidden [&_.wrapper]:text-ellipsis [&_a]:block [&_a]:overflow-hidden [&_a]:text-ellipsis';

type ColumnResizeKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'preventDefault' | 'stopPropagation'
>;

// Keys the resize handle consumes must not also reach the global pagination
// shortcuts listening on window, or resizing a column would page the table.
export const handleColumnResizeKey = (
  event: ColumnResizeKeyEvent,
  currentWidth: number,
  min: number,
  onResize: (width: number | undefined) => void,
): ColumnResizeAction => {
  const action = columnResizeActionForKey(event.key, currentWidth, min);
  if (action.type === 'ignore') return action;

  event.preventDefault();
  event.stopPropagation();
  onResize(action.type === 'reset' ? undefined : action.width);

  return action;
};
