// penrose's birthday
let seed = 20220706;

// 🤷 http://indiegamr.com/generate-repeatable-random-numbers-in-js/
export const seedRandom = (max?: number, min?: number) => {
  max = max || 1;
  min = min || 0;

  seed = (seed * 9301 + 49297) % 233280;
  const rnd = seed / 233280;

  return min + rnd * (max - min);
};
