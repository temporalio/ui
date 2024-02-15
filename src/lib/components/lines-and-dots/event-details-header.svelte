<script lang="ts">
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';

  export let text: string;
</script>

<div
  class="flex items-center items-center gap-1 bg-blurple px-4 py-2 text-slate-100"
>
  <p>{spaceBetweenCapitalLetters(text)}</p>
</div>
