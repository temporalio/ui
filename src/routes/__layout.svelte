<script>
  import '../app.postcss';
  import NavigationLink from '$lib/components/navigation-link.svelte';
</script>

<svelte:head>
  <title>Temporal</title>

  <link rel="manifest" href="site.webmanifest" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />

  <meta property="og:title" content="Temporal" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://temporal.io" />
  <meta property="og:image" content="/banner.png" />
</svelte:head>

<main>
  <nav id="sidebar">
    <img id="logo" src="/logo.png" alt="Temporal Logo" />
    <p>Namespace: <br /> default</p>
    <NavigationLink href="/" src="/home.svg" alt="Dashboard Icon"
      >Dashboard</NavigationLink
    >
    <NavigationLink href="/workflows" src="/workflow.svg" alt="Workflow Icon"
      >Workflows</NavigationLink
    >
  </nav>
  <div>
    <slot />
  </div>
</main>

<slot />

<style>
  main {
    display: grid;
    grid-template-columns: 0fr 1fr;
  }

  #logo {
    margin-bottom: 20px;
  }

  p {
    color: #fff;
    text-align: center;
    font-size: 12px;
  }

  #sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 112px;
    height: 100vh;
    padding: 24px 0px;
    background-color: #4338ca;
  }
</style>
