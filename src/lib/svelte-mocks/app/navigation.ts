export function disableScrollHandling(): void {
  null;
}

export async function goto(
  url: string | URL,
  opts?: {
    replaceState?: boolean;
    noscroll?: boolean;
    keepfocus?: boolean;
    state?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  },
): Promise<void> {
  url;
  opts;
}

export async function invalidate(
  dependency: string | ((href: string) => boolean),
): Promise<void> {
  dependency;
}

export async function prefetch(href: string): Promise<void> {
  href;
}

export async function prefetchRoutes(routes?: string[]): Promise<void> {
  routes;
}

export function beforeNavigate(
  fn: (navigation: { from: URL; to: URL | null; cancel: () => void }) => void,
): void {
  fn;
}

export function afterNavigate(
  fn: (navigation: { from: URL | null; to: URL }) => void,
): void {
  fn;
}
