export const findValueIfItIncludesWord = (object, word) => {
  for (var property in object) {
    if (object.hasOwnProperty(property) && property.toString().includes(word)) {
      return object[property];
    }
  }
};
