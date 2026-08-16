<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';
  import { slide } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';
  import { routeForNamespace } from '$lib/utilities/route-for';
  import ziggy from '$lib/vendor/ziggy-full-face.png';

  import BottomNavNamespaces from './bottom-nav-namespaces.svelte';
  import BottomNavSettings from './bottom-nav-settings.svelte';

  interface Props {
    namespaceList?: NamespaceListItem[];
    linksSnippet: Snippet;
    isCloud?: boolean;
    showNamespacePicker?: boolean;
    children?: Snippet;
    nsPicker?: Snippet<
      [
        {
          open: boolean;
          closeMenu: () => void;
        },
      ]
    >;
    centerButton?: Snippet<
      [
        {
          open: boolean;
          onClick: () => void;
        },
      ]
    >;
    menuButton?: Snippet<
      [
        {
          open: boolean;
          onClick: () => void;
        },
      ]
    >;
    linksContent?: Snippet<
      [
        {
          open: boolean;
          closeMenu: () => void;
        },
      ]
    >;
    profilePicture?: Snippet;
    class?: ClassNameValue;
  }

  let {
    namespaceList = [],
    linksSnippet,
    showNamespacePicker = true,
    children,
    nsPicker,
    centerButton,
    menuButton,
    linksContent,
    profilePicture,
    class: className = '',
  }: Props = $props();

  let viewLinks = $state(false);
  let viewNamespaces = $state(false);
  let viewSettings = $state(false);

  function escapeHandler(e: KeyboardEvent) {
    if (
      e.key === 'Escape' &&
      [viewLinks, viewNamespaces, viewSettings].some((isOpen) => isOpen)
    ) {
      closeMenu();
    }
  }

  beforeNavigate(() => {
    closeMenu();
  });

  const namespace = $derived(page.params.namespace || $lastUsedNamespace);
  const namespaceExists = $derived(
    namespaceList.some(
      (namespaceListItem) => namespaceListItem.namespace === namespace,
    ),
  );

  const onLinksClick = () => {
    viewLinks = !viewLinks;
    viewNamespaces = false;
    viewSettings = false;
  };

  const onNamespaceClick = () => {
    viewLinks = false;
    viewNamespaces = !viewNamespaces;
    viewSettings = false;
  };

  const onSettingsClick = () => {
    viewLinks = false;
    viewNamespaces = false;
    viewSettings = !viewSettings;
  };

  function closeMenu() {
    viewLinks = false;
    viewNamespaces = false;
    viewSettings = false;
  }

  const menuIsOpen = $derived(viewLinks || viewNamespaces || viewSettings);
  const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

  const truncateNamespace = (namespace: string) => {
    if (namespace.length > 16) {
      return `${namespace.slice(0, 8)}...${namespace.slice(-8)}`;
    }
    return namespace;
  };
</script>

<svelte:window onkeydown={escapeHandler} />

{#if menuIsOpen}
  <div
    class={merge(
      'group surface-primary fixed inset-x-0 top-0 z-50 w-full min-w-0 overflow-auto border-t border-subtle text-primary md:hidden',
      'bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))]',
      'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary',
    )}
    data-nav="open"
    in:slide={{ duration: reducedMotion.current ? 0 : 220, delay: 0 }}
    out:slide={{ duration: reducedMotion.current ? 0 : 140, delay: 0 }}
  >
    {#if linksContent}
      {@render linksContent({ open: viewLinks, closeMenu })}
    {:else if viewLinks}
      <div class="flex flex-col gap-2 px-4 py-4">
        {@render linksSnippet?.()}
      </div>
    {/if}
    {#if nsPicker}
      {@render nsPicker({ open: viewNamespaces, closeMenu })}
    {:else}
      <BottomNavNamespaces open={viewNamespaces} {namespaceList} />
    {/if}
    <BottomNavSettings open={viewSettings}>
      {@render children?.()}
    </BottomNavSettings>
  </div>
{/if}
<nav
  class={merge(
    'bottom-navigation surface-secondary fixed bottom-0 z-40 flex w-full min-w-0 flex-row items-center justify-between gap-2 border-t border-subtle pt-2 text-primary transition-colors md:hidden',
    'h-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] pb-[calc(0.5rem+env(safe-area-inset-bottom))]',
    'focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary focus-visible:[&_button]:outline-none focus-visible:[&_button]:ring-2 focus-visible:[&_button]:ring-primary',
    className,
  )}
  data-testid="top-nav"
  aria-label={translate('common.main')}
>
  {#if menuButton}
    {@render menuButton({ open: viewLinks, onClick: onLinksClick })}
  {:else}
    <button
      class="nav-button relative"
      data-testid="nav-menu-button"
      class:active-shadow={viewLinks}
      type="button"
      onclick={onLinksClick}
    >
      {#if viewLinks}
        <Icon name="close" height={32} width={32} />
      {:else}
        <Logo height={32} width={32} />
      {/if}
    </button>
  {/if}
  {#if showNamespacePicker}
    {#if centerButton}
      {@render centerButton({
        open: viewNamespaces,
        onClick: onNamespaceClick,
      })}
    {:else}
      <div class="namespace-wrapper">
        <Button
          variant="ghost"
          data-testid="namespace-switcher"
          leadingIcon="namespace-switcher"
          size="xs"
          class="h-full grow text-primary"
          onclick={onNamespaceClick}>{truncateNamespace(namespace)}</Button
        >
        <div class="ml-1 h-full w-1 border-l border-subtle"></div>
        <Button
          variant="ghost"
          size="xs"
          href={routeForNamespace({ namespace })}
          aria-label={`Open ${namespace} namespace overview`}
          disabled={!namespaceExists}
          class="h-full min-w-11 px-2"
          ><Icon class="text-primary" name="external-link" /></Button
        >
      </div>
    {/if}
  {/if}
  <button
    class="nav-button"
    data-testid="nav-profile-button"
    class:active-shadow={viewSettings}
    type="button"
    onclick={onSettingsClick}
  >
    {#if viewSettings}
      <Icon name="close" height={32} width={32} />
    {:else}
      <div
        class="flex aspect-square w-[32px] min-w-[32px] items-center justify-center"
      >
        {#if profilePicture}
          {@render profilePicture()}
        {:else}
          <img
            src={ziggy}
            alt={translate('common.user-profile')}
            class="h-[32px] w-[32px]"
          />
        {/if}
      </div>
    {/if}
  </button>
</nav>

<style lang="postcss">
  .namespace-wrapper {
    @apply surface-primary flex h-11 w-full min-w-0 grow flex-row items-center border border-subtle px-0.5 text-sm focus-within:border-interactive focus-within:outline-none focus-within:ring-2 focus-within:ring-primary;
  }

  .nav-button {
    @apply relative flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-control p-1 text-center align-middle text-xs font-medium uppercase transition-colors;
  }

  .bottom-navigation {
    padding-inline: max(var(--page-gutter), env(safe-area-inset-left))
      max(var(--page-gutter), env(safe-area-inset-right));
  }

  .nav-button.active-shadow {
    @apply bg-interactive-secondary-hover;
  }

  .nav-button.active-shadow::before {
    position: absolute;
    inset-inline: 0.5rem;
    top: -0.5rem;
    height: 0.125rem;
    content: '';

    @apply bg-interactive;
  }

  @media (hover: hover) and (pointer: fine) {
    .nav-button:hover {
      @apply bg-interactive-secondary-hover;
    }
  }
</style>
