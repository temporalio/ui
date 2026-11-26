const path = require('path');

module.exports = {
  plugins: [
    require('autoprefixer')(),
    require('tailwindcss/nesting')(),
    require('tailwindcss')({
      config: path.resolve(__dirname, '../../apps/ui/tailwind.config.ts'),
    }),
  ],
};
