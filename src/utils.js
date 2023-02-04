// Collection of useful functions.
// Javascript has a very bare-bones standard library when compared
// to other similar languages like ruby or python, so some functionality
// has to be replicated by hand.
export const randomBool = () =>
  Math.random() > 0.5;

export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

export const randomFromArray = (array) =>
  array[randomInt(0, array.length)];

export const shuffleArray = (array) =>
  array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

export const range = (length) =>
  Array.from({ length }, (_, i) => i);

