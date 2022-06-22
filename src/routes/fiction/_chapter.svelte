<script lang="ts">
  import { currentProps } from '$lib/stores/fiction-store';
  import type { SvelteComponentTyped } from 'svelte/internal';

  type ComponentProps<T> = T extends new (
    ...args: any[]
  ) => SvelteComponentTyped<infer Props>
    ? Props
    : unknown;

  type T = $$Generic;

  interface $$Props {
    description: string;
    component: T;
    props?: ComponentProps<T>;
  }

  export let description;
  export let props = {};
  let Component;
  export { Component as component };

  function handleClick() {
    currentProps.set({ ...props });
  }
</script>

<div
  on:click={handleClick}
  class="mt-4 cursor-pointer border rounded-sm p-4 hover:bg-gray-50"
>
  <h2 class="mb-4">{description}</h2>
  <svelte:component this={Component} {...props}>
    <slot />
  </svelte:component>
</div>
