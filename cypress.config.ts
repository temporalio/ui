import { defineConfig } from 'cypress';

defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/integration/**/*.cy.ts',
    baseUrl: 'localhost:3000',
    viewportWidth: 1280,
    projectId: 'g7xfxw',
    env: {
      VITE_API_HOST: 'http://localhost:8080',
      VITE_MODE: 'test',
      VITE_TEMPORAL_UI_BUILD_TARGET: 'local',
    },
  },

  component: {
    specPattern: 'src/**/*.cy.ts',
    devServer: {
      framework: 'svelte',
      bundler: 'vite',
    },
  },
});
