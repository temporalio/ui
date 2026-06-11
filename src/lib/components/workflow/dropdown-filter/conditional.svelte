<script lang="ts">
  interface Props {
    conditional?: string;
  }

  let { conditional = $bindable('=') }: Props = $props();
</script>

<div class="mt-2 transition-all hover:cursor-pointer">
  <button class="flex items-center" onclick={() => (conditional = '=')}>
    <div class="text-primary mr-2 ml-4 p-1" class:active={conditional === '='}>
      Is
    </div>
  </button>
  <button class="flex items-center" onclick={() => (conditional = '!=')}>
    <div class="text-primary mr-2 ml-4 p-1" class:active={conditional === '!='}>
      Is Not
    </div>
  </button>
</div>

<style lang="postcss">
  @reference "../../../../app.css";

  .active {
    @apply bg-black text-white;
  }
</style>
