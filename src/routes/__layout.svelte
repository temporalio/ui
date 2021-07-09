<script>
  import NavigationLink from '../components/navigation-link.svelte';
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
    <img id="logo" src="/logo.png" alt="gun" />
    <p>Namespace: <br/> default </p>
    <NavigationLink href="/">Home</NavigationLink>
    <NavigationLink href="/workflows">Workflows</NavigationLink>
  </nav>
  <slot />
</main>

<style>
  main {
    display: grid;
    grid-gap: 24px;
    grid-template-columns: 1fr;
  }
  #logo {
    margin-bottom: 20px;
  }
  p {
    color: #FFF;
    text-align: center;
  }
  #sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 112px;
    padding: 24px 0px;
    background-color: #4338CA;
  }
</style>