<script lang="ts">
  export let content: string;
</script>

<section class="h-full w-full">
  <iframe
    title="output"
    src="/render?content={encodeURIComponent(content)}"
    class="min-h-[300px] w-full rounded-md bg-white p-4 shadow-md"
  />
</section>
