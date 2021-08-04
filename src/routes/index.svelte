<script lang="ts">
  import { counter } from '$lib/stores/counter';
</script>

<p>{$counter}</p>

<button on:click={counter.increment}>Increment</button>
