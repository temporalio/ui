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

<label class="switch" class:disabled>
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
    data-testid={$$props['data-testid']}
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
    @apply px-2 relative flex items-center rounded min-w-fit cursor-pointer;

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
    @apply flex relative items-center h-5 w-9 rounded-xl border border-gray-600 bg-gray-50;

    &.hovered {
      @apply bg-gray-200;
    }

    &.focused:not(.checked) {
      @apply border-indigo-600;

      box-shadow: 0 0 0 4px #2463eb80; /* blue-600 at 50% opacity */
    }

    &.focused.checked {
      @apply border-white;

      box-shadow: 0 0 0 4px #2463eb80; /* blue-600 at 50% opacity */
    }

    &.disabled {
      @apply opacity-50;
    }

    &.checked {
      @apply bg-indigo-600 border-indigo-900;
    }
  }

  .thumb {
    @apply absolute h-4 w-4 rounded-[50%];

    &.checked {
      @apply right-0.5 bg-white;
    }

    &:not(.checked) {
      @apply left-0.5 bg-gray-900 text-white;
    }
  }
</style>
