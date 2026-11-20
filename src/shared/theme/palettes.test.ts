import { darkColors, lightColors, type Colors } from './palettes';

// WCAG contrast ratio: 1 is no contrast, 21 is black on white
function luminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5].map(start => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

test('the contrast helper agrees with the known extremes', () => {
  expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
});

test('both themes have a color for every name', () => {
  expect(Object.keys(darkColors).sort()).toEqual(
    Object.keys(lightColors).sort(),
  );
});

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('the %s colors', (_name, palette: Colors) => {
  // what is written on what (PRD §8: enough contrast). 4.5 is the WCAG AA
  // minimum for normal text
  const pairs: [keyof Colors, keyof Colors][] = [
    ['text', 'card'],
    ['text', 'background'],
    ['textSecondary', 'card'],
    ['textSecondary', 'background'],
    ['accent', 'card'],
    ['accent', 'background'],
    ['onAccent', 'accent'],
  ];

  test('a card can be told apart from the screen behind it', () => {
    expect(
      contrastRatio(palette.card, palette.background),
    ).toBeGreaterThanOrEqual(1.1);
  });

  test.each(pairs)('%s is easy to read on %s', (foreground, background) => {
    expect(
      contrastRatio(palette[foreground], palette[background]),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
