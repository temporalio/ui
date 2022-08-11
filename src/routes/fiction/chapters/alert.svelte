<script lang="ts">
  import Alert from '$holocene/alert.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter description="An info Alert">
  <Alert intent="info" title="Alert Title" icon="info" class="w-1/2">
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Alert>
</Chapter>

<Chapter description="An error Alert">
  <Alert intent="error" title="Alert Title" class="w-1/2">
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Alert>
</Chapter>

<Chapter description="A warning Alert">
  <Alert intent="warning" title="Alert Title" class="w-1/2">
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Alert>
</Chapter>

<Chapter description="A success Alert">
  <Alert intent="success" title="Alert Title" class="w-1/2">
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Alert>
</Chapter>

<Chapter description="An Alert with just a Title">
  <Alert
    intent="error"
    title="Lorem ipsum dolor sit amet consectetur adipisicing elit"
    class="w-1/2"
  />
</Chapter>
