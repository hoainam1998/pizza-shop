export default function (value: string) {
  const pass = /data:image\/\w+;base64,\w+/.test(value);
  const utils = this.utils;

  if (pass) {
    return {
      message: () => `expected ${utils.printReceived(value)} is not base64`,
      pass,
    };
  } else {
    return {
      message: () => `expected ${utils.printReceived(value)} is base64`,
      pass,
    };
  }
}
