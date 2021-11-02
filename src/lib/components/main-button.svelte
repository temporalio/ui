<script lang="ts">
  const getButtonState = (disabled?: boolean) => {
    if (disabled) {
      return 'disabled';
    }
    return 'default';
  };

  const getButtonStyle = (variant) => {
    switch (variant) {
      case 'secondary':
        return 'secondary';
      case 'destroy':
        return 'destroy';
      case 'primary':
      default:
        return 'primary';
    }
  };

  const getButtonSize = (size) => {
    switch (size) {
      case 'small':
        return 'small';
      case 'default':
      default:
        return 'default';
    }
  };

  export let disabled: boolean = false;
  export let variant: string = '';
  export let active: boolean = false;
  export let size: string = 'default';

  const buttonState = getButtonState(disabled);
  const showDisabled = buttonState !== 'default';
</script>

<button
  on:click
  disabled={showDisabled}
  class={`${getButtonSize(size)} ${getButtonStyle(variant)}`}
  class:active><slot /></button
>

<style lang="postcss">
  .small {
    @apply text-sm;
  }

  .large {
    @apply text-lg;
  }

  .primary {
    @apply text-purple-700 bg-purple-300 border-2 rounded-md py-2 px-4 transition-colors;
  }

  .primary:disabled {
    @apply text-purple-400 border-purple-400 cursor-not-allowed;
  }

  .primary:hover:enabled {
    @apply bg-white;
  }

  .secondary {
    @apply text-purple-600 border-purple-600 border-2 rounded-md px-2 transition-colors;
  }

  .secondary:disabled {
    @apply text-purple-400 border-purple-400 cursor-not-allowed;
  }

  .secondary:hover:enabled {
    @apply text-white bg-purple-300;
  }

  .destroy {
    @apply text-white bg-red-600 border-2 rounded-md py-2 px-4 transition-colors;
  }

  .destroy:disabled {
    @apply text-red-400 border-red-400 cursor-not-allowed;
  }

  .destroy:hover:enabled {
    @apply bg-white text-red-400 border-red-400;
  }
</style>
