import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'g7xfxw',
  env: {
    VITE_API_HOST: 'http://localhost:8233',
    VITE_MODE: 'test',
    VITE_TEMPORAL_UI_BUILD_TARGET: 'local',
  },
  viewportWidth: 1280,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
