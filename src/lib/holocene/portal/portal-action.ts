export function portal(
  node: HTMLElement,
  target: HTMLElement | string = document.body,
) {
  const targetEl =
    typeof target === 'string' ? document.querySelector(target) : target;

  if (!targetEl) {
    console.warn('Portal target not found');
    return {
      destroy() {},
    };
  }

  targetEl.appendChild(node);

  return {
    destroy() {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    },
  };
}
