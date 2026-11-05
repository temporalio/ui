<script lang="ts" module>
  export type AgentSkill = {
    slug: string;
    repository: string;
    preview: boolean;
  };
</script>

<script lang="ts">
  let {
    skills,
    class: className = '',
  }: { skills: AgentSkill[]; class?: string } = $props();
</script>

<figure
  class={['body-small-mono space-y-3 p-4 leading-5 text-primary', className]}
>
  {#each skills as skill (skill.slug)}
    <div>
      <p class="break-words pl-4 -indent-4">
        <span class="text-secondary" aria-hidden="true">$</span>
        <code
          >npx skills add <span class="inline-block max-w-full indent-0"
            >{skill.repository}</span
          ></code
        >
      </p>
      <p class="pl-4">
        <span class="text-success" aria-hidden="true">✓</span>
        <span class="sr-only">Installed</span>
        {skill.slug}
        {#if skill.preview}
          <span class="text-secondary">· Public Preview</span>
        {/if}
      </p>
    </div>
  {/each}
  <p aria-hidden="true">
    <span class="text-secondary">$</span><span
      class="ml-2 border-l border-current"
    ></span>
  </p>
  <figcaption class="sr-only">
    Example: installing the skills with the skills CLI
  </figcaption>
</figure>
