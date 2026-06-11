const tailwindcss = require('@tailwindcss/postcss');
const cssnano = require('cssnano');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
  plugins: [
    tailwindcss(),
    !dev &&
      cssnano({
        preset: 'default',
      }),
  ],
};

module.exports = config;
