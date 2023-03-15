<script lang="ts">
  import LineDot from './event-summary-card/line-dot.svelte';
</script>

<div class="flex gap-2">
  <LineDot event={undefined} removeTail />
  <div class="h-full grow pt-8 text-gray-500">
    <p>Running...</p>
  </div>
</div>
