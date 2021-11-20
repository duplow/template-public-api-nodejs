var dictionary = [
  '0','1','2','3','4','5','6','7','8','9',
  'A','B','C','D','E','F'
];

const randomHex = () => {
  return `${dictionary[Math.round(Math.random() * 15)]}${dictionary[Math.round(Math.random() * 15)]}`;
};

const randomColor = () => {
  return `${randomHex()}${randomHex()}${randomHex()}`;
};

module.exports = randomColor;