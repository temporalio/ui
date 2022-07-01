<script lang="ts">
  import SplitButton from '$lib/holocene/split-button.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter description="A Split Button">
  <SplitButton label="Edit">
    <a class="text-red-700" href="/">Delete Namespace</a>
  </SplitButton>
</Chapter>

<Chapter description="A disabled Split Button">
  <SplitButton label="Edit" disabled />
</Chapter>

<Chapter description="A right-aligned Split Button">
  <div class="flex flex-row justify-end">
    <SplitButton label="Edit" right>
      <a href="/">Edit Namespace</a>
      <a class="text-red-700" href="/">Delete Namespace</a>
    </SplitButton>
  </div>
</Chapter>
