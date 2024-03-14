<script lang="ts">
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';

  export let text: string;
</script>

<div
  class="flex items-center items-center gap-1 px-4 py-2 text-xl font-medium text-white"
>
  <p>{spaceBetweenCapitalLetters(text)}</p>
</div>
