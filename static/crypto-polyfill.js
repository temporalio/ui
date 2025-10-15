// Polyfill for crypto.randomUUID() - for browsers that don't support it
(function () {
  // Ensure crypto object exists
  if (typeof crypto === 'undefined') {
    console.warn('crypto API not available - some features may not work');
    return;
  }

  // Add randomUUID if not available
  if (!crypto.randomUUID) {
    crypto.randomUUID = function () {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
        /[018]/g,
        function (c) {
          return (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
          ).toString(16);
        },
      );
    };
  }
})();
