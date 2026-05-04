const twemoji = require('twemoji');

const str = "🌹 😄 仙人掌 🌵";
const parsed = twemoji.parse(str, {
  base: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/',
  folder: 'apple/64',
  ext: '.png'
});

console.log(parsed);
