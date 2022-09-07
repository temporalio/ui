<script>import Icon from '$holocene/icon/icon.svelte';
export let title;
export let subtitle = '';
export let icon = null;
export let open = false;
export let disabled = false;
export let readOnly = false;
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

<style>
  .open {

    margin-bottom: 2rem
}

  .content {

    display: block
}
  .disabled {

    cursor: default
}</style>
