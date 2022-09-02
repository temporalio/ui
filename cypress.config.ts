import { defineConfig } from 'cypress';
import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin';

export default defineConfig({
  viewportWidth: 1280,
  projectId: 'g7xfxw',

  env: {
    VITE_API_HOST: 'http://localhost:8080',
    VITE_MODE: 'test',
    VITE_TEMPORAL_UI_BUILD_TARGET: 'local',
  },

  e2e: {
    setupNodeEvents(on, config) {
      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.ts',
    baseUrl: 'http://localhost:3000/',
  },

  component: {
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on, config);
      return config;
    },
    specPattern: 'src/**/*.cy.ts',
    excludeSpecPattern: ['**/snapshots/*', '**/__image_snapshots__/*'],
    devServer: {
      framework: 'svelte',
      bundler: 'vite',
    },
  },
});
