export default function handleContextLogging(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>,
) {
  const originMethod = descriptor.value!;
  descriptor.value = function (...args: any[]) {
    const context = args[1];
    const pattern = /([A-Z][a-z]+)/g;
    const matches = context.match(pattern)!;
    if ((matches || []).length) {
      const indexOfMatchWord = context.indexOf(matches[0]);
      let firstWord = context.slice(0, indexOfMatchWord);
      firstWord = `${firstWord.charAt(0).toUpperCase()}${firstWord.slice(1, firstWord.length)}`;
      const name = matches
        .reduce((str: string, match: string) => {
          const firstChar = match.charAt(0).toLowerCase();
          const lastChars = match.slice(1, match.length);
          const newWord = `${firstChar}${lastChars} `;
          str += newWord;
          return str;
        }, '')
        .trim();
      args[1] = `${firstWord} ${name}`;
    }
    originMethod.apply(this, args);
  };
  return descriptor;
}
