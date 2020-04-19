export default (str, ...words) =>
words.some((word) => str.indexOf(word) !== -1)