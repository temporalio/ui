<script lang="ts">
  import colors from 'tailwindcss/colors';
  import Icon from '$holocene/icon/icon.svelte';
  import type { IconName } from './icon/paths';
  export let title: string;
  export let subtitle: string = '';
  export let icon: IconName | undefined = undefined;
  export let open: boolean = false;
  export let disabled: boolean = false;
  export let readOnly: boolean = false;

  $: open = disabled ? true : open;
</script>

<section
  class="flex w-full cursor-default flex-row rounded-lg border border-gray-300 bg-white p-8 {$$props.class}"
>
  <div class="w-full">
    <div
      class="accordion-open flex {!readOnly ? 'cursor-pointer' : ''} flex-col"
      class:open
      class:disabled
      on:click={() => {
        if (disabled || readOnly) return;
        open = !open;
      }}
    >
      <div class="space-between flex flex-row">
        <h2 class="flex w-full items-center gap-2 text-lg font-medium">
          {#if icon}<Icon name={icon} />{/if}
          {title}
        </h2>
        {#if !readOnly}
          <Icon
            name={open ? 'chevron-up' : 'chevron-down'}
            class={disabled ? 'text-gray-500' : 'text-primary'}
          />
        {/if}
      </div>
      <h3>{subtitle}</h3>
    </div>
    <div class="hidden w-full" class:content={open}>
      <slot />
    </div>
  </div>
</section>

<style lang="postcss">
  .open {
    @apply mb-8;
  }

  .content {
    @apply block;
  }
  .disabled {
    @apply cursor-default;
  }
</style>
