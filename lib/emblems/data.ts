/**
 * 5-Chapter Cartesian Pixel Emblems & Editorial Story Matrix Data
 * Extracted pixel-for-pixel from the authentic OGREES 1080p reference screencast
 * (32×32 outer Cartesian grid with 28×28 inner emblem viewport).
 *
 * Each emblem is represented as an exact 28×28 Cartesian coordinate matrix,
 * paired with synchronized chapter metadata, solid #000000 outlines, official hex palettes,
 * and StarMatch astrological editorial narrative.
 */

export interface ChapterEmblem {
  id: string;
  number: '01' | '02' | '03' | '04' | '05';
  title: string;
  subtitle: string;
  category: string;
  editorial: string;
  primaryColor: string;
  accentColor: string;
  dimensions: { width: number; height: number };
  matrix: readonly string[];
  palette: Record<string, string>;
}

// --------------------------------------------------------------------------
// 01 // Oracle Ghost (Exact OGREES Frame 003 28×28 Extraction)
// #F04208 orange-red body, #FFFFFF sclera, #0A0454 deep indigo pupils
// --------------------------------------------------------------------------
const MATRIX_GHOST: readonly string[] = [
  '............................', // 00
  '............................', // 01
  '...........######...........', // 02
  '...........#OOOO#...........', // 03
  '.......#####OOOO#####.......', // 04
  '.......#OOOOOOOOOOOO#.......', // 05
  '.....###OOOOOOOOOOOO###.....', // 06
  '.....#OOOOOOOOOOOOOOOO#.....', // 07
  '.....#OOOWWOOOOOOWWOOO#.....', // 08
  '.....#OOWWBBOOOOWWBBOO#.....', // 09
  '...###OOWWBBOOOOWWBBOO###...', // 10
  '...#OOOOWWWWOOOOWWWWOOOO#...', // 11
  '...#OOOOOWWOOOOOOWWOOOOO#...', // 12
  '...#OOOOOOOOOOOOOOOOOOOO#...', // 13
  '...#OOOOOOOOOOOOOOOOOOOO#...', // 14
  '...#OOOOOOOOOOOOOOOOOOOO#...', // 15
  '...#OOOOOOOOOOOOOOOOOOOO#...', // 16
  '...#OOOOOOOOOOOOOOOOOOOO#...', // 17
  '...#OOOOOOOOOOOOOOOOOOOO#...', // 18
  '...#OOOO##OOOOOOOO##OOOO#...', // 19
  '...#OOOO##OOOOOOOO##OOOO#...', // 20
  '...#OO######OOOO######OO#...', // 21
  '...#OO#....#OOOO#....#OO#...', // 22
  '...####....######....####...', // 23
  '............................', // 24
  '............................', // 25
  '............................', // 26
  '............................', // 27
];

// --------------------------------------------------------------------------
// 02 // Twin Cherries (Exact OGREES Frame 011 28×28 Extraction)
// #E10005 crimson flesh, #3C7C00 olive stem, #6DF28C mint highlight, #F2AA96 pink shine
// --------------------------------------------------------------------------
const MATRIX_CHERRIES: readonly string[] = [
  '............................', // 00
  '............................', // 01
  '.......................###..', // 02
  '.....................#####..', // 03
  '...................##..###..', // 04
  '.................##....#....', // 05
  '...............##.....#.....', // 06
  '.............##......#......', // 07
  '.......####.#.......#.......', // 08
  '.....##RRRR##.......#.......', // 09
  '....#RRRRRGRR#.....#........', // 10
  '...#RRRRRGRRRR#...#.........', // 11
  '...#RRRRRGRRRR#..####.......', // 12
  '..#RRRRRRGRRRR###RGRR##.....', // 13
  '..#RRRRRRRRRR##RRGRRRRR#....', // 14
  '..#RRPRRRRRR##RRRGRRRRRR#...', // 15
  '..#RRRLRRRRR##RRRGRRRRRR#...', // 16
  '...#RRRLRRRR#RRRRRRRRRRRR#..', // 17
  '...#RRRRGRRR#RRRRRRRRRRRR#..', // 18
  '....#RRRRRRR#RRPRRRRRRRRR#..', // 19
  '.....##RRRR##RRRLRRRRRRRR#..', // 20
  '.......####..#RRRLRRRRRRR#..', // 21
  '.............#RRRRGRRRRRR#..', // 22
  '..............#RRRRRRRRR#...', // 23
  '...............##RRRRR##....', // 24
  '.................#####......', // 25
  '............................', // 26
  '............................', // 27
];

// --------------------------------------------------------------------------
// 03 // Alchemical Flask (Exact OGREES Frame 014 28×28 Extraction)
// #ED1805 scarlet elixir & vapor drops, #CBF9F5 cyan glass, #F5A5B9 pink reflection
// --------------------------------------------------------------------------
const MATRIX_FLASK: readonly string[] = [
  '............................', // 00
  '............................', // 01
  '...........R................', // 02
  '................R...........', // 03
  '.............R..............', // 04
  '..........R.................', // 05
  '.................R..........', // 06
  '............RRRR............', // 07
  '...........######...........', // 08
  '..........#CRRRRC#..........', // 09
  '...........#RRRR#...........', // 10
  '...........#CCCC#...........', // 11
  '...........#CCCC#...........', // 12
  '...........#CCCC#...........', // 13
  '.........##CCCCCC##.........', // 14
  '........#CCCCCCCCCC#........', // 15
  '........#CCCCCCCCCC#........', // 16
  '.......#CRRRRRRRRRRC#.......', // 17
  '.......#CRRRRRRRRRRC#.......', // 18
  '.......#CRPRRRRRRRRC#.......', // 19
  '.......#CRPRRRRRRRRC#.......', // 20
  '.......#CRRPRRRRRRRC#.......', // 21
  '........#CRRRRRRRRC#........', // 22
  '........#CCRRRRRRCC#........', // 23
  '.........##CCCCCC##.........', // 24
  '...........######...........', // 25
  '............................', // 26
  '............................', // 27
];

// --------------------------------------------------------------------------
// 04 // Radiant Pixel Heart (Exact OGREES Frame 020 28×28 Extraction)
// #E60005 scarlet heart, #FFFFFF right-lobe specular shine
// --------------------------------------------------------------------------
const MATRIX_HEART: readonly string[] = [
  '............................', // 00
  '............................', // 01
  '............................', // 02
  '............................', // 03
  '......###..........###......', // 04
  '.....#RRR#........#RRR#.....', // 05
  '....#RRRRR#......#RRRRR#....', // 06
  '...#RRRRRRR#....#RRWWWRR#...', // 07
  '..#RRRRRRRRR#..#RRWRRRWRR#..', // 08
  '..#RRRRRRRRRR##RRRRRRRRWR#..', // 09
  '..#RRRRRRRRRRRRRRRRRRRRWR#..', // 10
  '..#RRRRRRRRRRRRRRRRRRRRWR#..', // 11
  '..#RRRRRRRRRRRRRRRRRRRRRR#..', // 12
  '..#RRRRRRRRRRRRRRRRRRRRRR#..', // 13
  '...#RRRRRRRRRRRRRRRRRRRR#...', // 14
  '....#RRRRRRRRRRRRRRRRRR#....', // 15
  '.....#RRRRRRRRRRRRRRRR#.....', // 16
  '......#RRRRRRRRRRRRRR#......', // 17
  '.......#RRRRRRRRRRRR#.......', // 18
  '........#RRRRRRRRRR#........', // 19
  '.........#RRRRRRRR#.........', // 20
  '..........#RRRRRR#..........', // 21
  '...........#RRRR#...........', // 22
  '............#RR#............', // 23
  '.............##.............', // 24
  '............................', // 25
  '............................', // 26
  '............................', // 27
];

// --------------------------------------------------------------------------
// 05 // Cyber Split-Mask (Exact OGREES Frame 023 28×28 Extraction)
// #14FF82 neon green upper-left, #E100F5 magenta lower-right, #000000 + eyes & mouth
// --------------------------------------------------------------------------
const MATRIX_MASK: readonly string[] = [
  '............................', // 00
  '............................', // 01
  '............................', // 02
  '............................', // 03
  '......####........####......', // 04
  '......#NN#........#NN#......', // 05
  '...####NN##########NN####...', // 06
  '..#NNNNNNNNNNNNNNNNNNNNMM#..', // 07
  '..#NNNNNNNNNNNNNNNNNNNNMM#..', // 08
  '..#NNNN##NNNNNNNNNN##NNMM#..', // 09
  '..#NNNN##NNNNNNNNNN##NNMM#..', // 10
  '..#NN######NNNNNN######MM#..', // 11
  '..#NN######NNNNNN######MM#..', // 12
  '..#NNNN##NNNNNNNNNN##MMMM#..', // 13
  '..#NNNN##NNNNNNNNNN##MMMM#..', // 14
  '..#NNNNNNNN##NN##NNMMMMMM#..', // 15
  '..#NNNNNNNN##NN##NNMMMMMM#..', // 16
  '..#NNNNNN####NN####MMMMMM#..', // 17
  '..#NNNNNN####NN####MMMMMM#..', // 18
  '..###NNNNMMMMMMMMMMMMMM###..', // 19
  '....#NNNNMMMMMMMMMMMMMM#....', // 20
  '....###MM##########MM###....', // 21
  '......#MM#........#MM#......', // 22
  '......####........####......', // 23
  '............................', // 24
  '............................', // 25
  '............................', // 26
  '............................', // 27
];

/**
 * Standardize and sanitize rows to ensure#28 characters per row, 28 rows total.
 */
function sanitizeMatrix(raw: readonly string[]): readonly string[] {
  const result: string[] = [];
  for (let i = 0; i < 28; i++) {
    const row = raw[i] || '';
    if (row.length === 28) {
      result.push(row);
    } else if (row.length < 28) {
      result.push(row.padEnd(28, '.'));
    } else {
      result.push(row.slice(0, 28));
    }
  }
  return Object.freeze(result);
}

export const CHAPTER_EMBLEMS: readonly ChapterEmblem[] = [
  {
    id: '01',
    number: '01',
    title: 'Giving Our Best',
    subtitle: 'Oracle Spirit // High-Precision Tension Vectors',
    category: 'TRUTH DISCLOSURE',
    editorial:
      'We do not flatter, soothe, or fabricate cosmic compatibility. StarMatch calculates cold, high-precision orbital vectors to reveal the raw tension and real gravitational pull between two psyches.',
    primaryColor: '#F04208',
    accentColor: '#0A0454',
    dimensions: { width: 28, height: 28 },
    matrix: sanitizeMatrix(MATRIX_GHOST),
    palette: {
      '.': 'transparent',
      '#': '#000000',
      O: '#F04208',
      W: '#FFFFFF',
      B: '#0A0454',
    },
  },
  {
    id: '02',
    number: '02',
    title: "Adding Value Where Others Don't",
    subtitle: 'Binary Orbs // Coupled Celestial Dynamics',
    category: 'BINARY PRECISION',
    editorial:
      'Sun signs are only 1/12th of the equation. By synchronizing all 10 planetary bodies, lunar nodes, and house cusps, we illuminate the intricate binary orbit linking two separate lives.',
    primaryColor: '#E10005',
    accentColor: '#3C7C00',
    dimensions: { width: 28, height: 28 },
    matrix: sanitizeMatrix(MATRIX_CHERRIES),
    palette: {
      '.': 'transparent',
      '#': '#000000',
      R: '#E10005',
      G: '#3C7C00',
      L: '#6DF28C',
      P: '#F2AA96',
      W: '#FFFFFF',
    },
  },
  {
    id: '03',
    number: '03',
    title: 'Pushing Boundaries',
    subtitle: 'Alchemical Flask // Catalytic Conflict & Chemistry',
    category: 'ALCHEMICAL FRICTION',
    editorial:
      'Real intimacy is alchemical. We isolate the catalytic friction points where personal defense mechanisms dissolve, transforming unspoken conflict into deep emotional resonance.',
    primaryColor: '#ED1805',
    accentColor: '#CBF9F5',
    dimensions: { width: 28, height: 28 },
    matrix: sanitizeMatrix(MATRIX_FLASK),
    palette: {
      '.': 'transparent',
      '#': '#000000',
      R: '#ED1805',
      C: '#CBF9F5',
      P: '#F5A5B9',
      W: '#FFFFFF',
    },
  },
  {
    id: '04',
    number: '04',
    title: 'Connecting Hearts, Stars, and People',
    subtitle: 'Radiant Heart // Inviolable Emotional Architecture',
    category: 'RESONANCE MECHANICS',
    editorial:
      "Compatibility isn't about seamless harmony; it's about mutual resonance under pressure. StarMatch connects psychological blueprints to reveal what makes a bond indestructible.",
    primaryColor: '#E60005',
    accentColor: '#FFFFFF',
    dimensions: { width: 28, height: 28 },
    matrix: sanitizeMatrix(MATRIX_HEART),
    palette: {
      '.': 'transparent',
      '#': '#000000',
      R: '#E60005',
      W: '#FFFFFF',
    },
  },
  {
    id: '05',
    number: '05',
    title: 'Driving Truth Through Astronomy',
    subtitle: 'Cyber-Mask // Sub-Milliradian Ephemeris Calculus',
    category: 'DETERMINISTIC CODE',
    editorial:
      'Moving beyond superstitious newspaper columns with sub-milliradian VSOP87 ephemerides, deterministic scoring algorithms, and ruthless psychological transparency.',
    primaryColor: '#14FF82',
    accentColor: '#E100F5',
    dimensions: { width: 28, height: 28 },
    matrix: sanitizeMatrix(MATRIX_MASK),
    palette: {
      '.': 'transparent',
      '#': '#000000',
      N: '#14FF82',
      M: '#E100F5',
      W: '#FFFFFF',
    },
  },
];

/**
 * Helper to fetch a chapter emblem by 1-based index (0 to 4) or chapter number ('01' - '05')
 */
export function getChapterEmblem(indexOrNumber: number | string): ChapterEmblem {
  if (typeof indexOrNumber === 'string') {
    const found = CHAPTER_EMBLEMS.find((c) => c.number === indexOrNumber || c.id === indexOrNumber);
    if (found) return found;
  }
  const idx = typeof indexOrNumber === 'number' ? indexOrNumber : parseInt(indexOrNumber, 10) - 1;
  const clamped = Math.max(0, Math.min(CHAPTER_EMBLEMS.length - 1, isNaN(idx) ? 0 : idx));
  return CHAPTER_EMBLEMS[clamped];
}
