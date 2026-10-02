type PageViewport = Readonly<{ top: number; height: number }>;

export function observePageViewport(
  node: HTMLDivElement,
  onviewport: (viewport: PageViewport) => void,
) {
  const scrollOwner = node.closest<HTMLElement>('#content-wrapper');
  if (!scrollOwner) throw new Error('Missing workflow page scroll container');

  const measure = () => {
    onviewport({
      top:
        scrollOwner.getBoundingClientRect().top +
        scrollOwner.clientTop -
        node.getBoundingClientRect().top,
      height: scrollOwner.clientHeight,
    });
  };

  const observer = new ResizeObserver(measure);
  for (
    let ancestor: HTMLElement | null = node;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    observer.observe(ancestor);
    if (ancestor === scrollOwner) break;
  }
  scrollOwner.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);
  measure();

  return {
    destroy() {
      observer.disconnect();
      scrollOwner.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    },
  };
}
