<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Alert from './alert.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="An Information Alert">
    <Alert intent="info" title="Alert Title" icon="info" role="status">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
        exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
        sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
        itaque?
      </p>
    </Alert>
  </Hst.Variant>
  <Hst.Variant title="An Error Alert">
    <Alert icon="error" intent="error" title="Alert Title">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
        exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
        sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
        itaque?
      </p>
    </Alert>
  </Hst.Variant>
  <Hst.Variant title="A Bold Error Alert">
    <Alert icon="error" intent="error" title="Alert Title" bold>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
        exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
        sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
        itaque?
      </p>
    </Alert>
  </Hst.Variant>
  <Hst.Variant title="A Warning Alert">
    <Alert icon="warning" intent="warning" title="Alert Title">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
        exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
        sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
        itaque?
      </p>
    </Alert>
  </Hst.Variant>
  <Hst.Variant title="A Success Alert">
    <Alert intent="success" title="Alert Title">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
        exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
        sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
        itaque?
      </p>
    </Alert>
  </Hst.Variant>
  <Hst.Variant title="An Alert with just a Title">
    <Alert
      intent="error"
      title="Lorem ipsum dolor sit amet consectetur adipisicing elit"
    />
  </Hst.Variant>
  <Hst.Variant title="An Alert without a Title">
    <Alert icon="error" intent="error">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
        exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
        sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
        itaque?
      </p>
    </Alert>
  </Hst.Variant>
</Hst.Story>
