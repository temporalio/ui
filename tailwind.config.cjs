const { TemporalColors } = require('./theme.ts');

const config = {
  mode: 'jit',
  purge: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: TemporalColors,
    },
  },
  plugins: [],
};

module.exports = config;
