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

export function getIdentity() {
  const email = getCoreContext().getUserIdentifier();
  return email ? `${email} - webui` : 'webui';
}
