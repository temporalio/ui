<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';
  import type { Writable } from 'svelte/store';

  export let namespaceList: NamespaceListItem[] = [];
  export let open: Writable<boolean>;

  let searchValue = '';
  let focusedIndex = 0;

  let divElement: HTMLDivElement;

  const getFocusableElements = () => {
    if ($open && divElement) {
      return Array.from(
        divElement.querySelectorAll<
          HTMLButtonElement | HTMLInputElement | HTMLDivElement
        >('input, a'),
      ).filter((element) => {
        if (element instanceof HTMLDivElement) return element.isContentEditable;
        return !element.disabled;
      });
    }
    return [];
  };

  const handleTabKey = (event: KeyboardEvent) => {
    const focusable = getFocusableElements();
    const inputElement = focusable[0];
    const lastListItemElement = focusable[focusable.length - 1];
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === inputElement) {
          lastListItemElement.focus();
          focusedIndex = focusable.length - 1;
          event.preventDefault();
        } else {
          focusedIndex = focusedIndex - 1;
        }
      } else {
        if (document.activeElement === lastListItemElement) {
          inputElement.focus();
          focusedIndex = 0;
          event.preventDefault();
        } else {
          focusedIndex = focusedIndex + 1;
        }
      }
    }
  };

  const handleArrowKey = (event: KeyboardEvent) => {
    const focusable = getFocusableElements();
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (focusedIndex === 1) return;
      else {
        const next = focusable[focusedIndex - 1];
        if (next) {
          next.focus();
          focusedIndex = focusedIndex - 1;
        }
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (focusedIndex === 0) {
        // Input tab prevents updating focusedIndex
        const next = focusable[2];
        if (next) {
          next.focus();
          focusedIndex = focusedIndex + 2;
        }
      } else {
        const next = focusable[focusedIndex + 1];
        if (next) {
          next.focus();
          focusedIndex = focusedIndex + 1;
        }
      }
    }
  };

  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    const focusable = getFocusableElements();
    if (!$open || !focusable.length || focusable.length === 1) {
      return;
    }

    handleTabKey(event);
    handleArrowKey(event);
  };

  $: {
    if ($open) {
      const focusable = getFocusableElements();
      const inputElement = focusable[0];
      inputElement.focus();
    }
  }

  $: sortedAndFilteredList = namespaceList
    .sort((a, b) => {
      if (a.namespace > b.namespace) return 1;
      if (b.namespace > a.namespace) return -1;
      return 0;
    })
    .filter(({ namespace }) => namespace.includes(searchValue));
</script>

<div
  on:keydown={handleKeyboardNavigation}
  class="w-full py-4 px-2 md:px-8 lg:px-12"
  bind:this={divElement}
>
  <div class="prose my-4">
    <h2 class="text:xl md:text-2xl" data-testid="namespace-select-header">
      Select a Namespace
    </h2>
  </div>
  <div class="mb-4">
    <Input
      autoFocus
      id="namespace-search"
      bind:value={searchValue}
      icon="search"
      placeholder="Search"
    />
  </div>

  <ul data-test="namespace-list">
    {#each sortedAndFilteredList as namespace}
      <li class="item" data-testid="namespace-list-item">
        <a
          on:click={() => ($lastUsedNamespace = namespace.namespace)}
          href={namespace.href(namespace.namespace)}
          class="flex w-full p-3"
          class:active={namespace.namespace === $page.params?.namespace}
        >
          <div class="active h-6 w-6">
            {#if namespace.namespace === $page.params?.namespace}
              <Icon name="checkmark" />
            {/if}
          </div>
          <p class="link">{namespace.namespace}</p>
        </a>
      </li>
    {:else}
      <EmptyState title="No Namespaces" />
    {/each}
  </ul>
</div>

<style lang="postcss">
  .item {
    @apply flex border-collapse cursor-pointer gap-2 border-b border-l-2 border-r-2 border-gray-900 bg-white from-blue-100 to-purple-100 first:rounded-t-xl first:border-t-2 last:rounded-b-xl last:border-b-2 hover:bg-gradient-to-br focus:bg-gradient-to-br;
  }

  .link {
    @apply ml-2 truncate text-gray-900;
  }

  .link:hover {
    @apply underline;
  }
</style>
