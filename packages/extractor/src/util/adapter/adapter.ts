// show only 2nd char and spaces
export const obfuscate = (arg: string) =>
  arg
    .trim()
    .split("")
    .reduce((str, char, i) => str + (i === 1 || char === " " ? char : "*"), "");
