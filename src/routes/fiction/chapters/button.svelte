<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Button from '$holocene/button.svelte';
</script>

<Chapter description="A primary button" component={Button}>Primary</Chapter>

<Chapter
  description="A secondary button"
  component={Button}
  props={{ secondary: true }}>Secondary</Chapter
>

<Chapter
  description="A dangerous button"
  component={Button}
  props={{ destroy: true }}>Danger</Chapter
>

<Chapter
  description="A disabled primary button"
  component={Button}
  props={{ disabled: true }}>Disabled Primary</Chapter
>

<Chapter
  description="A disabled secondary button"
  component={Button}
  props={{ disabled: true, secondary: true }}>Disabled Secondary</Chapter
>

<Chapter
  description="A disabled dangerous button"
  component={Button}
  props={{ disabled: true, secondary: true, destroy: true }}
  >Disabled Danger</Chapter
>

<Chapter
  description="A button as an anchor"
  component={Button}
  props={{ href: 'https://temporal.io', as: 'anchor' }}>Link</Chapter
>

<Chapter
  description="A button with an Icon"
  component={Button}
  props={{ icon: 'refresh', iconScale: 0.8 }}
>
  Reload
</Chapter>

<Chapter
  description="A button with a Count"
  component={Button}
  props={{ count: 3 }}
>
  Save
</Chapter>

<Chapter description="some buttons next to each other">
  <div class="flex flex-row gap-2">
    <Button>Primary</Button>
    <Button secondary>Secondary</Button>
    <Button destroy>Danger</Button>
    <Button icon="refresh" secondary>Refresh</Button>
    <Button loading secondary>Loading</Button>
  </div>
</Chapter>
