<script lang="ts">
  import colors from 'tailwindcss/colors';
  import Icon from '$lib/holocene/icon/index.svelte';
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
          {#if icon}<Icon scale={1.25} name={icon} />{/if}
          {title}
        </h2>
        {#if !readOnly}
          <Icon
            name={open ? 'caretUp' : 'caretDown'}
            stroke={disabled ? colors.gray[500] : 'currentcolor'}
            scale={1.4}
          />
        {/if}
      </div>
      <h3>{subtitle}</h3>
    </div>
    {#if open}
      <div class="w-full">
        <slot />
      </div>
    {/if}
  </div>
</section>

<style lang="postcss">
  .open {
    @apply mb-8;
  }

  .disabled {
    @apply cursor-default;
  }
</style>
