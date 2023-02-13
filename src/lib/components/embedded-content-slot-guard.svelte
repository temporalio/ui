<script lang="ts">
  import type { CoreUserPages } from '$lib/models/core-user';
  import { userSettings } from '$lib/stores/user-settings';
  import EmbeddedContentIframe from './embedded-content-iframe.svelte';

  export let page: CoreUserPages;

  $: top = $userSettings[`${page}.TOP`];
  $: left = $userSettings[`${page}.LEFT`];
  $: right = $userSettings[`${page}.RIGHT`];
  $: bottom = $userSettings[`${page}.BOTTOM`];

  let width = 600;
</script>

{#if top}
  <EmbeddedContentIframe title="top" src={top} />
{/if}
{#if left}
  <div class="flex gap-2">
    <div class={`w-[${width.toString()}px] left-0 top-0 min-h-screen`}>
      <EmbeddedContentIframe title="left" src={left} />
    </div>
    <div class={`w-[calc(100vw-${width.toString()}px)]`}>
      <slot />
    </div>
  </div>
{:else if right}
  <div class="flex gap-2">
    <div class={`w-[calc(100vw-${width.toString()}px)]`}>
      <slot />
    </div>
    <div class={`w-[${width.toString()}px] left-2/3 top-0 min-h-screen`}>
      <EmbeddedContentIframe title="right" src={right} />
    </div>
  </div>
{:else}
  <slot />
{/if}
{#if bottom}
  <EmbeddedContentIframe title="bottom" src={bottom} />
{/if}
