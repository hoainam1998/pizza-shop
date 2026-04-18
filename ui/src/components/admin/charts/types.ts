const sizePropertyPattern = /\d+(px|vh|vw|%)?/;

export default {
  width: {
    type: [String, Number],
    validator(value: any) {
      return sizePropertyPattern.test(value);
    }
  },
  height: {
    type: [String, Number],
    validator(value: any) {
      return sizePropertyPattern.test(value);
    }
  },
};
