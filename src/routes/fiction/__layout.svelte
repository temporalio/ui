<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ fetch }) => {
    const res = await fetch('/fiction/chapters');
    if (res.ok) {
      const json = await res.json();

      return {
        props: {
          chapters: json.chapters,
        },
      };
    }
    return {
      props: {
        chapters: [],
      },
    };
  };
</script>

<script lang="ts">
  import '../../app.css';
  import { currentProps } from '$lib/stores/fiction-store';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let chapters: string[];
</script>

<svelte:head>
  <title>Temporal - Fiction</title>

  <link rel="manifest" href="/site.webmanifest" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta property="og:title" content="Temporal - Fiction" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://temporal.io" />
  <meta property="og:image" content="/banner.png" />
</svelte:head>

<main class="flex h-screen w-screen">
  <nav class="h-full w-96 border-r-2 p-4">
    <h1>Fiction 📚</h1>
    <ul class="ml-4">
      {#each chapters as chapter}
        <li>
          <a href="/fiction/chapters/{chapter}">{chapter}</a>
        </li>
      {/each}
    </ul>
  </nav>
  <article class="flex h-full w-full flex-col justify-between">
    <div class="flex flex-col p-8">
      <slot />
    </div>
    <div class="h-96">
      {#key $currentProps}
        <CodeBlock content={$currentProps} />
      {/key}
    </div>
  </article>
</main>
