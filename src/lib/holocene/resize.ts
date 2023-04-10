import { writable } from 'svelte/store';

export const resizableContainerWidth = writable<number>();

export const resize = (node: HTMLElement): { destroy: () => void } => {
  let resizing = false;

  const handleMouseDown = (event: MouseEvent) => {
    if (node.clientWidth - event.x < 3) {
      resizing = true;
    }
    return false;
  };

  const handleMouseUp = () => {
    resizing = false;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!resizing) return false;
    const rect = node.getBoundingClientRect();
    resizableContainerWidth.set(event.x - rect.x);
    return false;
  };

  node.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return {
    destroy: () => {
      node.removeEventListener('mousedown', handleMouseDown, false);
      node.removeEventListener('mousemove', handleMouseMove, false);
      node.removeEventListener('mouseup', handleMouseUp, false);
    },
  };
};
