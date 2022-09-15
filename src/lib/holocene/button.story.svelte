<script lang="ts">
  import { hstEvent } from 'histoire/client';
  import Button from './button.svelte';

  let disabled: boolean = false;
  let thin: boolean = false;
  let loading: boolean = false;

  export let Hst;
</script>

<Hst.Story>
  <Hst.Variant title="Primary">
    <Button
      on:click={(event) => hstEvent('click', event)}
      bind:loading
      bind:thin
      bind:disabled
      variant="primary">Primary</Button
    >
  </Hst.Variant>
  <Hst.Variant title="Secondary">
    <Button
      on:click={(event) => hstEvent('click', event)}
      bind:loading
      bind:thin
      bind:disabled
      variant="secondary">Secondary</Button
    >
  </Hst.Variant>
  <Hst.Variant title="Destructive">
    <Button
      on:click={(event) => hstEvent('click', event)}
      bind:loading
      bind:thin
      bind:disabled
      variant="destructive">Destructive</Button
    >
  </Hst.Variant>
  <Hst.Variant title="Login">
    <Button
      on:click={(event) => hstEvent('click', event)}
      bind:loading
      bind:thin
      bind:disabled
      variant="login">Login</Button
    >
  </Hst.Variant>
  <Hst.Variant title="Link">
    <Button variant="link">A Link</Button>
  </Hst.Variant>
  <Hst.Variant title="Anchor">
    <Button href="https://temporal.io">An Anchor</Button>
  </Hst.Variant>
  <Hst.Variant title="Icon">
    <Button icon="retry">Retry</Button>
  </Hst.Variant>
  <Hst.Variant title="Badge">
    <Button count={3}>Save</Button>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value={disabled} title="Disabled" />
    <Hst.Checkbox bind:value={thin} title="Thin" />
    <Hst.Checkbox bind:value={loading} title="Loading" />
  </svelte:fragment>
</Hst.Story>
