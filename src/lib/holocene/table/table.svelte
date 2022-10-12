<script lang="ts">
  export let variant: 'simple' | 'fancy' = 'fancy';
  export let updating = false;
</script>

<table class="{variant} {$$props.class}">
  <thead>
    <slot name="headers" />
    {#if updating}
      <div class="meter">
        <span style="width: 100%" />
      </div>
    {/if}
  </thead>
  <tbody>
    <slot />
  </tbody>
</table>

<style lang="postcss">
  .meter {
    box-sizing: content-box;
    box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.3);
    @apply absolute left-0 right-0 top-9 h-[5px] bg-gradient-to-r from-blue-200 to-blue-600;
    z-index: 5;
  }
  .meter > span {
    display: block;
    height: 100%;
    background-color: rgb(59, 130, 246);
    background-image: linear-gradient(
      center bottom,
      rgb(96, 165, 250) 32%,
      rgb(59, 130, 246) 77%
    );
    box-shadow: inset 0 2px 9px rgba(255, 255, 255, 0.25),
      inset 0 -2px 6px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;
  }
  .meter > span:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-image: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.2) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.2) 75%,
      transparent 75%,
      transparent
    );
    z-index: 1;
    background-size: 25px 25px;
    animation: move 1.5s linear infinite;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    overflow: hidden;
  }

  @keyframes move {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 25px 25px;
    }
  }

  table {
    @apply relative;
  }

  table {
    thead :global(th) {
      @apply text-left font-secondary text-sm font-medium;
    }

    tbody :global(td) {
      @apply text-left text-sm;
    }
  }

  table.fancy {
    @apply border-separate border-spacing-0 rounded-lg border-gray-300;

    thead {
      @apply bg-gray-900 text-gray-100;

      :global(th) {
        @apply border-t border-gray-300 py-2 px-1;

        &:first-child {
          @apply w-[1px] rounded-tl-lg border-l border-gray-300;
        }

        &:last-child {
          @apply w-[1px] rounded-tr-lg border-r border-gray-300;
        }
      }
    }

    tbody :global {
      td {
        @apply border-t border-gray-300 px-1 py-2 text-sm;

        &:first-child {
          @apply border-l border-gray-300;
        }

        &:last-child {
          @apply w-0 border-r border-gray-300 p-0;
        }
      }

      &:last-child {
        td {
          @apply border-b border-gray-300;

          &:first-child {
            @apply rounded-bl-lg;
          }

          &:last-child {
            @apply rounded-br-lg;
          }
        }
      }
    }
  }

  table.simple {
    thead :global(th) {
      @apply border-b border-primary py-2;
    }

    tbody :global(td) {
      @apply border-b border-gray-300 py-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
</style>
