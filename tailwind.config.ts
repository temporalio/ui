import temporal, { textStyles } from './src/lib/theme/plugin';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [temporal, textStyles],
};

export default config;
