import { getContext, setContext } from 'svelte';

interface CoreContext {
  getUserIdentifier: () => string | undefined;
}

const CORE_CONTEXT_KEY = 'core-context';

export const setCoreContext = (context: CoreContext) => {
  setContext(CORE_CONTEXT_KEY, context);
};

export function getCoreContext() {
  return getContext(CORE_CONTEXT_KEY) as CoreContext;
}

export function formatIdentity(identity?: string) {
  return identity ? `${identity} - webui` : 'webui';
}

export function getIdentity() {
  const identity = getCoreContext().getUserIdentifier();
  return formatIdentity(identity);
}
