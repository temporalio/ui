<!-- Based loosely on https://www.w3.org/WAI/ARIA/apg/patterns/switch/examples/switch-checkbox/a -->
<script lang="ts">
  export let checked = false;
  export let id: string;
  export let disabled = false;
  export let label: string;
  export let labelPosition: 'left' | 'right' = 'right';
  export let labelHidden = false;

  let focused = false;
  let hovered = false;

  const handleFocus = () => {
    focused = true;
  };

  const handleBlur = () => {
    focused = false;
  };

  const handleMouseEnter = () => {
    hovered = true;
  };

  const handleMouseLeave = () => {
    hovered = false;
  };
</script>

<label class="switch" class:disabled data-testid={$$props['data-testid']}>
  {#if labelPosition === 'left'}
    <span class="label left" class:sr-only={labelHidden}>
      {label}
    </span>
  {/if}
  <input
    on:change
    {id}
    {disabled}
    bind:checked
    type="checkbox"
    class="checkbox"
    role="switch"
    on:focus={handleFocus}
    on:blur={handleBlur}
  />
  <span
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    class="slider"
    class:disabled
    class:checked
    class:focused
    class:hovered
  >
    <span class="thumb" class:checked />
  </span>
  {#if labelPosition === 'right'}
    <span class="label right" class:sr-only={labelHidden}>
      {label}
    </span>
  {/if}
</label>

<style lang="postcss">
  .switch {
    @apply relative flex min-w-fit cursor-pointer items-center rounded px-2;

    &.disabled {
      @apply pointer-events-none;
    }
  }

  .label {
    @apply whitespace-nowrap text-sm;

    &.left {
      @apply mr-2;
    }

    &.right {
      @apply ml-2;
    }
  }

  .checkbox {
    @apply absolute w-0 opacity-0;
  }

  .slider {
    @apply relative flex h-5 w-9 items-center rounded-xl border border-slate-600 bg-slate-50;

    &.hovered:not(.checked) {
      @apply bg-slate-200;
    }

    &.hovered.checked {
      @apply bg-indigo-800;
    }

    &.focused:not(.checked) {
      @apply border-indigo-600 shadow-focus shadow-blue-600/50;
    }

    &.focused.checked {
      @apply border-white shadow-focus shadow-blue-600/50;
    }

    &.disabled {
      @apply opacity-50;
    }

    &.checked {
      @apply border-indigo-900 bg-indigo-600;
    }
  }

  .thumb {
    @apply absolute h-4 w-4 rounded-[50%];

    &.checked {
      @apply surface-primary right-0.5;
    }

    &:not(.checked) {
      @apply left-0.5 bg-slate-900 text-white;
    }
  }
</style>
