type NavigationTarget = {
  params: Record<string, string> | null;
  route: { id: string | null };
  scroll: { x: number; y: number } | null;
  url: URL;
};

type BeforeNavigation = {
  cancel: () => void;
  complete: Promise<void>;
  delta?: number;
  from: NavigationTarget;
  to: NavigationTarget | null;
  type: 'goto' | 'leave' | 'link' | 'popstate';
  willUnload: boolean;
};

const beforeNavigationCallbacks: ((navigation: BeforeNavigation) => void)[] =
  [];
const gotoCalls: string[] = [];

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
  gotoCalls.push(String(url));
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
  fn: (navigation: BeforeNavigation) => void,
): void {
  beforeNavigationCallbacks.push(fn);
}

export function afterNavigate(
  fn: (navigation: { from: URL | null; to: URL }) => void,
): void {
  fn;
}

export function triggerBeforeNavigate(to: string) {
  let canceled = false;
  const target = (url: URL, routeId: string): NavigationTarget => ({
    params: {},
    route: { id: routeId },
    scroll: null,
    url,
  });
  const navigation: BeforeNavigation = {
    cancel: () => (canceled = true),
    complete: Promise.resolve(),
    from: target(
      new URL('http://localhost/namespaces/default/catalog/create'),
      '/namespaces/[namespace]/catalog/create',
    ),
    to: target(
      new URL(to, 'http://localhost'),
      '/namespaces/[namespace]/catalog',
    ),
    type: 'link',
    willUnload: false,
  };
  for (const callback of beforeNavigationCallbacks) callback(navigation);
  return { canceled };
}

export function getGotoCalls() {
  return [...gotoCalls];
}

export function resetNavigationMocks() {
  beforeNavigationCallbacks.length = 0;
  gotoCalls.length = 0;
}
