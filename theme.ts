// Ignore this rule because tailwind is all cjs and we need to use requires here
// Maybe come back to this but this seems to be the easy way out
/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors');
/* eslint-enable @typescript-eslint/no-var-requires */

const TemporalColors = {
  ...colors,
};

// We're probably gonna remove some values on objects when we iterate on this
function omit(obj, ...props) {
  const result = { ...obj };
  props.forEach(function (prop) {
    delete result[prop];
  });
  return result;
}

module.exports = {
  TemporalColors,
};
