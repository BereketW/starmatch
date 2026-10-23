'use client';

import React, { useRef, useEffect } from 'react';

interface HalftoneHandsCanvasProps {
  className?: string;
  interactive?: boolean;
}

interface CellNode {
  x0: number;
  y0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  level: number; // 1..15
  r: number;
  c: number;
  glyph: string;
  isSolidDot: boolean;
  radius: number;
  alpha: number;
  phase: number;
  hand: 'left' | 'right' | 'sky';
}

/**
 * Exact 43x84 Left Hand & 52x90 Right Hand Peak-Contrast ASCII-Halftone Matrices
 * extracted directly from /home/birat/Pictures/Screenshots/Screenshot From 2026-10-23 18-28-00.png (1361x799)
 * with UI text masked out and per-cell stroke peak + mean luminance preserved:
 * - Left Hand: x0 = 3.318px, y0 = 280.825px, dx = 6.48px, dy = 6.49px (84 cols x 43 rows)
 * - Right Hand: x0 = 785.30px, y0 = 316.18px, dx = 6.285px, dy = 6.29px (90 cols x 52 rows)
 */
const LEFT_HAND_MATRIX: readonly string[] = [
  '....................................................................................',
  '....................................................................................',
  '...............................F56FF................................................',
  '..............................FFFFDEFF2.............................................',
  '.............................FFFFFFFFFFFD.4FFF......................................',
  '......................EFFF4.3FFFFC4FFFFFFFDEFF5.....................................',
  '...............3DDFCDFEFFFFFDFFFFEFFFFFFFFFFFFFEF5..................................',
  '............45FDDCBFEFEFFFFFEFFFFCEFFFFFFFFFFFFFFCDE3...............................',
  '.........3EDDFBFDEFFFFFFFFFFFEFFEFFDFFFFFFFFFFFFFFFB5FFD............................',
  '....4..CFFEFFEFFFFFFFFFFFFFFDECFEFFEFFFFFFFFFFFFFFFFFFFFFF.3........................',
  '.34.DDFEFFFFFFFFFFFEEFFFFFFFFFFFFFEFFFFDBBCFEFFFFFFFFFFFFFEF........................',
  'FEFFFEFFFFFFFFFFFDFFFFFFFFFCFEFFEFFFFFFFFFDFFFFFFFFFFFFFFFFFCB......................',
  'FFFFFFFFFFFEFEEEFFFDFFFFFFF5EEFFFFCEFEBFEFEBFFFFFFFFFFFFFFFFFFEFF...................',
  'FFFFFFFFFFFFFFFFBFFFFCDFFFEFFFFFFFFECFBCFEFFDEFFFFFFFFFFFFFFFFFFEF..................',
  'FFFDEEFFEFFFBFEFBCBDFFFFFFFFFFFFFFFECFDE4FDFFFFFFFFFFFFFFFFFFFFFFF..................',
  'FFFFFEFFDEDFFCCCCFFFFFFFFFFFFFFFFFFFF33EC.FFFFFFFFFFFFFFFFFFFFFFFF2.................',
  'FEDFFFCFFEFCCBFFFFFFFFFFEFDFFFFFFFFFFCBBBC6CEFCFEFFFFFFFEFFFFFFFFEF3................',
  'FFCFFEFFFECFFFFFFFFFFEDDCFFFFFFFFFFFFEFFFB5DDEFFFFFFFFFFFFFFFFFFFFFFF3..............',
  'FFDFDFCDFFFFFFFFFCEB744744FFFFFFFFFFFDEFBFCCCCFEFFFFFFFFFFFFFFFDFDFFFFF.............',
  'FFFBBFFFFFEFFFFBDB447555455FFFFFC.B4.4DDFBBBDDFFFFFFFFEFFFFFFFFFDFFFFFFC............',
  'AAAFFFFEEFFCCDC6444573476BCFFFFFC......CFF44.4FFFDFFFFFFFFFFFFFFFFDDEFFFE...........',
  'BFFFDDFEFD576666567695CBEDEFFFFD........CBB86FFFEDFFFFBEFFFFCFEEFFFDFFFFFFFC........',
  'FFDDEEFDF5656554456CBEEEEDEDFFF.........3.CDCDFDFFDFFFDFFFFFBDFFFFFFAFFFFFFF4.......',
  'EEEDFCCE867676CBFEFFFFFFFFDFC.............CCDFF8FFFBFFFFFFFFEFFEFFFFFFDFFFFFF.......',
  'DDFD555E74FDBFDFFDFFFFEFFFC................4FFFFFFFCFFFFEFFF5FDADEFFF46FEFFFF.......',
  'FD324435FEFFFEEFBFFFEF......................2..FCFFFEEFFFEFE.36CFF5FFD6EFEFFFF......',
  '5454565FFEEFFFDDFFF...........................3.BCBFDFFDFFF...FFDBBFFFF3DEFEFFF.....',
  '5444EFFFFFFFFFFFF................................5FFCFFDFFF3..EFEFFFFFF..6FEFFFF....',
  'DCFEFFFFFFFFEF5...................................4CCF5EFFFF..EFFFFFFFFC..FDEEEB....',
  'FFFFFFFFFFEFE.......................................BB5EFFFF6.FDBFCFFFFF..36FFFF....',
  'FFFFFFFFFFF.........................................34543FFFF3.BCDDCDFDF...FDDFEF...',
  'FFFFDDFFFD..........................................BBC75DFFEB.CCEFEFEFF....DDFFE3..',
  'FFFCFDFFE...........................................DFD4FFFFFF.3CDFFBEFF.....DDFFF..',
  'FFFFFDFF...........................................3FFFCFFFFFE43CFFFDCFFD....FEEFC..',
  'FFFFFFE...........................................4.FEFEFFFFEF44DFFFBFFFE.....FEC3..',
  'FFFFF.............................................36DFFF.FFDFC.FDFFDFFFF6...........',
  'FEDFFF.............................................BFFDE.EBFF3.45FFD7DEF4...........',
  'FFFFF..............................................3FFE........25FFE6FFF4...........',
  'FEFD................................................3...........4FFD5EFF6...........',
  '................................................................FFF6FFFFF...........',
  '................................................................33C435EF4...........',
  '.....................................................................6DF4...........',
  '.....................................................................4EF............',
];

const RIGHT_HAND_MATRIX: readonly string[] = [
  '..........................................................................................',
  '.........................................................................................2',
  '.................................................................FF.64445335.4533353375343',
  '..................................................................2345454344.3534354365443',
  '..............................................................9B4334547DCADD9BC6.363365343',
  '.......................................................FF.2..52344345BDECACEADFA8CFBCFECC9',
  '.....................................................32232223423549CDACB9DEC8AEB8AFAAFCAD8',
  '.................................................3333432332.2569CB9BBAEFFFF98CC979D88FB8B7',
  '........................................FF.333443442353234223E7BFDACAFFFFFFB8AB79BB99FDAA8',
  '.......................................2.2253344344336389C98AE8CAFFFFFFFFFFFFCA89BA9BB8AC7',
  '..................................2....33234334434326CA79A97D98FFFFFEEDFEFFFFFFC9CA9BB8AB8',
  '..............2..........3...2..3....2233..5334433336D978C98BFFFFECDEDDFDEEFFFFFFFFFFFFFFF',
  '..............F2.242345345...A6253.34.2433.6445534546DA79B89DFDDFDCDDCDECEFDCEFDFFFFFFFFFF',
  '.......243563253.3322342364453346.2322.322.5334523488DA7987EFFFDFFDEDCDFDEFDCEFFDEFFDFECCF',
  '....33343235.24322352342342243234223A5.322.4324324A98DA6AFFFFFDCEDCDECEECDDECDFFDEFECFFCDC',
  '.535422447BF79B869C879B9A52233336864A67B2236223A8BA88D7DFFFFFECDECBDCDEDCEFDBEEDCEECCDDBCB',
  '.645689CFFFF8BFFFFF88AC89C644489D869A78B523635BB8B87BEFFFFFFFECDECCDDDEDDFFFDFDDDFFFFFFFFC',
  '.B9ACEFDDDFFFFFECFF979B7AC545B8AD86BB77B2235AAB8AB99DFEFFFFFFEDEEDCDDDEFFFFFDDFECFFFFFFFFC',
  '.88DFCEFFFFFCFFFEEF87988ABB95A8AD86AA6833..E99B89DFFFFDFFFFFFECDECCEDCDFFFFDCDFECEFFFFFEDC',
  '.B8BDADFFEDF2233.2.65A984DA85A7CE96A5223224C7ACFFFFFFFFFFFFFFFDEFFFFDEFFFFFDCEEDDFFFFFFEDF',
  '..........................34589CF9633225559FFFFDCFDDFFFFFFFFFFDFFFFFFFFFFFFFFFFDEEFFFEFEEB',
  '..........................59E99CD4..599B8EFEDEEDDFDEFFFFFFDFFEDFFFFFFFFFFFFFFFFFFFFFFFFFDC',
  '..........................CBFC6352.2C6DFEDEFDDDDDEEEFFEFFFDCFFFDFFFFFFFFFFFFFFFFFFFFFFFEDC',
  '..........................335323438DFFFFFDEEFDFECEEDFFEEFFEDFFEEFFFFFFFFFFFFDEFFCFFFDFFFFF',
  '.........................4235434698EFFFFFDFFEEFEDEEDFFEFFFDFFFFFFFFFEFFFFFFFF8E86AF7FFFFFF',
  '.........................4336C9C58DFEDEFFFFFFFFDDEDEFFCFFFDEFA336434C8.3.................3',
  '.........................449FFEDFFFFFDEFFFDFFDDEDDFDDFFEFFA9F6............................',
  '.......................334AFFFFFFFFFFFEFFFDFFEEFEDFEEFFFFFC...............................',
  '.......................224AEFEEFFEFFFDEFFFFFFDEFDEFDEFEDF3................................',
  '......................42349ADDDEEDFFFCFFFFFFDDDEDEFFFE5...................................',
  '......................422538FFFFFEDFFEFFFFDFFDDEEFFDCF....................................',
  '......................523548EFFFFEDFFFDFFEDFFDDEBC5.......................................',
  '......................3..436CFFFECFFFFFFECDFFD4...........................................',
  '......................635399CFFEFCEFFFFF8.2...............................................',
  '......................4..589CEDDEFFEFFFF9.................................................',
  '......................4345ADFFEBECDDFFFF7.................................................',
  '......................33458AEFF9EADFFFFF5.................................................',
  '.......................4577BEFFAEADFFFFE3.................................................',
  '.......................3467AEC9AEACFFFFF4.................................................',
  '........................356EF9ACFACFB6DF8.................................................',
  '......................22347FFE9DF67C425C9.................................................',
  '......................2344AEFE8BF.6A4234A7................................................',
  '.......................324BCFD8CFF.442.446A4..............................................',
  '.......................335BDFDACE...D72435EA..............................................',
  '.......................2338CFE9EF....88DCFFB..............................................',
  '........................44FFFE7DF.......BFF9..............................................',
  '.......................24DCFFAADFF........................................................',
  '.......................36FDDE9BEFB........................................................',
  '........................6FEC69FFFF........................................................',
  '.........................4..5FFEF.........................................................',
  '............................4CFF4.........................................................',
  '............................5FD3..........................................................',
];

// Exact ASCII density glyph ramp seen in the 18-28-00.png reference:
// levels 1..15 map to ['.', ':', ';', '*', '?', '%', '$', '#', '@']
const GLYPH_RAMP = [' ', '.', '.', ':', ';', '*', '?', '?', '%', '%', '$', '$', '#', '#', '@', '@'];

function mapCellGlyph(level: number, r: number, c: number, hand: 'left' | 'right'): {
  glyph: string;
  isSolidDot: boolean;
} {
  if (hand === 'left') {
    if (level >= 15) {
      const pick = (r * 3 + c * 5) % 4;
      return { glyph: pick === 0 ? '#' : '@', isSolidDot: pick !== 0 };
    }
    if (level >= 13) {
      const pick = (r * 7 + c * 13) % 3;
      return { glyph: pick === 0 ? '#' : pick === 1 ? '$' : '@', isSolidDot: pick === 2 };
    }
    if (level >= 10) {
      const pick = (r * 5 + c * 11) % 3;
      return { glyph: pick === 0 ? '$' : pick === 1 ? '%' : '#', isSolidDot: false };
    }
    if (level >= 7) {
      return { glyph: (r + c) % 2 === 0 ? '%' : '?', isSolidDot: false };
    }
    if (level >= 5) {
      return { glyph: (r + c) % 2 === 0 ? '?' : '*', isSolidDot: false };
    }
    if (level >= 3) {
      return { glyph: ':', isSolidDot: false };
    }
    return { glyph: '.', isSolidDot: false };
  }

  // Right hand in 18-28-00.png features prominent contour halftone dots ('●') along the upper ridge
  // and lower fingertip, plus high-contrast '%', '$', '#', '?', '*', ':', '.' ASCII glyphs across the hand
  const isContourDot =
    (r === 2 && (c === 64 || c === 65)) ||
    (r === 5 && (c === 55 || c === 56)) ||
    (r === 8 && (c === 40 || c === 41)) ||
    (r === 12 && (c === 14 || c === 15)) ||
    (r === 42 && (c === 32 || c === 33)) ||
    (r === 46 && (c === 31 || c === 32)) ||
    (r === 48 && (c === 31 || c === 32));

  if (isContourDot) {
    return { glyph: '@', isSolidDot: true };
  }

  if (level >= 14) {
    const pick = (r * 3 + c * 7) % 4;
    return {
      glyph: pick === 0 ? '@' : pick === 1 ? '#' : pick === 2 ? '$' : '%',
      isSolidDot: pick === 0,
    };
  }
  if (level >= 11) {
    const pick = (r * 5 + c * 9) % 3;
    return { glyph: pick === 0 ? '#' : pick === 1 ? '$' : '%', isSolidDot: false };
  }
  if (level >= 8) {
    const pick = (r * 3 + c * 5) % 3;
    return { glyph: pick === 0 ? '$' : pick === 1 ? '%' : '?', isSolidDot: false };
  }
  if (level >= 5) {
    return { glyph: (r + c) % 2 === 0 ? '?' : '*', isSolidDot: false };
  }
  if (level >= 3) {
    return { glyph: (r + c) % 2 === 0 ? ':' : ';', isSolidDot: false };
  }
  return { glyph: '.', isSolidDot: false };
}

export function HalftoneHandsCanvas({
  className = '',
  interactive = true,
}: HalftoneHandsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cellStep = 6.4;

    const pointer = {
      x: -1000,
      y: -1000,
      active: false,
    };

    let nodes: CellNode[] = [];

    function buildNodes() {
      nodes = [];

      // Proportional viewport mapping to 1361 x 799 reference so both Left and Right hands
      // are always 100% visible, properly sized, and flush with the left and right edges.
      const scaleX = width / 1361;
      const scaleY = height / 799;
      const unitScale = Math.min(scaleX, scaleY * 1.15);

      // Left Hand native grid: 84 cols x 43 rows spanning x = 0..39.5% of width
      const lDx = 6.48 * scaleX;
      const lDy = 6.49 * unitScale;
      cellStep = Math.min(lDx, lDy);

      const leftStartX = 3.318 * scaleX;
      const leftStartY = height * 0.3515;

      for (let r = 0; r < LEFT_HAND_MATRIX.length; r++) {
        const rowStr = LEFT_HAND_MATRIX[r];
        const y = leftStartY + r * lDy;
        for (let c = 0; c < rowStr.length; c++) {
          const ch = rowStr[c];
          if (ch === '.') continue;
          const level = parseInt(ch, 16);
          if (Number.isNaN(level) || level <= 0) continue;

          const x = leftStartX + c * lDx;
          const { glyph, isSolidDot } = mapCellGlyph(level, r, c, 'left');
          const norm = level / 15;

          nodes.push({
            x0: x,
            y0: y,
            x,
            y,
            vx: 0,
            vy: 0,
            level,
            r,
            c,
            glyph,
            isSolidDot,
            radius: Math.max(1.25 * unitScale, (0.28 + norm * 0.19) * cellStep),
            alpha: Math.min(0.95, 0.42 + norm * 0.53),
            phase: c * 0.09 + r * 0.14,
            hand: 'left',
          });
        }
      }

      // Right Hand native grid: 90 cols x 52 rows spanning x = 57.7%..100% of width
      const rDx = 6.285 * scaleX;
      const rDy = 6.29 * unitScale;
      const rightCols = RIGHT_HAND_MATRIX[0].length;
      const rightStartX = width - (rightCols - 0.5) * rDx;
      const rightStartY = height * 0.3957;

      for (let r = 0; r < RIGHT_HAND_MATRIX.length; r++) {
        const rowStr = RIGHT_HAND_MATRIX[r];
        const y = rightStartY + r * rDy;
        for (let c = 0; c < rowStr.length; c++) {
          const ch = rowStr[c];
          if (ch === '.') continue;
          const level = parseInt(ch, 16);
          if (Number.isNaN(level) || level <= 0) continue;

          const x = rightStartX + c * rDx;
          const { glyph, isSolidDot } = mapCellGlyph(level, r, c, 'right');
          const norm = level / 15;

          nodes.push({
            x0: x,
            y0: y,
            x,
            y,
            vx: 0,
            vy: 0,
            level,
            r,
            c,
            glyph,
            isSolidDot,
            radius: isSolidDot
              ? Math.max(1.75 * unitScale, 0.42 * cellStep)
              : Math.max(1.2 * unitScale, (0.26 + norm * 0.18) * cellStep),
            alpha: isSolidDot ? 0.88 : Math.min(0.94, 0.45 + norm * 0.49),
            phase: (rightCols - c) * 0.09 + r * 0.14,
            hand: 'right',
          });
        }
      }

      // Subtle upper-sky horizontal dotted horizon segments from 18-28-00.png:
      // Left horizon row at y = 133/799 (ny = 0.1665), cols 0..46
      const skyLeftY = height * 0.1665;
      for (let c = 0; c < 46; c++) {
        if (c > 12 && c < 18) continue;
        if (c > 31 && c < 36) continue;
        const x = leftStartX + c * lDx;
        nodes.push({
          x0: x,
          y0: skyLeftY,
          x,
          y: skyLeftY,
          vx: 0,
          vy: 0,
          level: 4,
          r: 0,
          c,
          glyph: '.',
          isSolidDot: false,
          radius: 0.9 * unitScale,
          alpha: 0.38,
          phase: c * 0.1,
          hand: 'sky',
        });
      }

      // Top-right horizon dotted segments under navbar at y = 73/799 (ny = 0.0914)
      const skyRightY = height * 0.0914;
      const skyClusters = [
        [0.575, 0.625],
        [0.671, 0.712],
        [0.785, 0.828],
        [0.882, 0.935],
      ];
      for (const [startFrac, endFrac] of skyClusters) {
        let idx = 0;
        for (let x = width * startFrac; x <= width * endFrac; x += lDx) {
          nodes.push({
            x0: x,
            y0: skyRightY,
            x,
            y: skyRightY,
            vx: 0,
            vy: 0,
            level: 4,
            r: 0,
            c: idx++,
            glyph: '.',
            isSolidDot: false,
            radius: 0.9 * unitScale,
            alpha: 0.38,
            phase: x * 0.02,
            hand: 'sky',
          });
        }
      }
    }

    function resize() {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(320, rect.width || window.innerWidth || 1361);
      height = Math.max(340, rect.height || window.innerHeight || 799);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      buildNodes();
    }

    resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseleave', onPointerLeave);
    container.addEventListener('touchmove', onPointerMove, { passive: true });
    container.addEventListener('touchend', onPointerLeave);

    function render(time: number) {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const hoverRadius = 68;
      const fontSize = Math.max(6.2, cellStep * 1.04);
      ctx.font = `700 ${fontSize.toFixed(1)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Calm, subtle traveling wave across the ASCII grid (never scatters the hands)
      const tSec = time * 0.0014;

      for (let i = 0; i < nodes.length; i++) {
        const d = nodes[i];

        let targetX = d.x0;
        let targetY = d.y0;
        let hoverBoost = 0;

        if (pointer.active && d.hand !== 'sky') {
          const dx = d.x0 - pointer.x;
          const dy = d.y0 - pointer.y;
          const dist = Math.hypot(dx, dy);

          if (dist < hoverRadius && dist > 0.001) {
            const falloff = 1 - dist / hoverRadius;
            hoverBoost = falloff * falloff;
            // Gentle <= 1.2px micro-ripple that preserves the crisp grid alignment
            const offset = hoverBoost * 1.2;
            targetX = d.x0 + (dx / dist) * offset;
            targetY = d.y0 + (dy / dist) * offset;
          }
        }

        // Smooth critically-damped interpolation toward target grid cell
        d.x += (targetX - d.x) * 0.22;
        d.y += (targetY - d.y) * 0.22;

        // Subtle organic shimmer along the hand grid
        const shimmer = Math.sin(tSec - d.phase) * 0.06;
        const effectiveAlpha = Math.min(
          0.98,
          Math.max(0.32, d.alpha + shimmer + hoverBoost * 0.15)
        );

        // High-contrast neutral charcoal-gray palette on #F7F7F7 (rgb 52..126)
        const grayTone = Math.max(
          42,
          Math.round(128 - (d.level / 15) * 76 - hoverBoost * 18)
        );

        if (d.isSolidDot) {
          const rPulse = d.radius * (1 + shimmer * 0.35 + hoverBoost * 0.12);
          ctx.beginPath();
          ctx.arc(d.x, d.y, rPulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${grayTone}, ${grayTone}, ${grayTone}, ${effectiveAlpha.toFixed(3)})`;
          ctx.fill();
        } else {
          let glyphToDraw = d.glyph;
          if (hoverBoost > 0.35 && d.level >= 5 && d.level <= 13) {
            const shiftedLevel = Math.min(15, d.level + 2);
            glyphToDraw = GLYPH_RAMP[shiftedLevel] || d.glyph;
          }
          ctx.fillStyle = `rgba(${grayTone}, ${grayTone}, ${grayTone}, ${effectiveAlpha.toFixed(3)})`;
          ctx.fillText(glyphToDraw, d.x, d.y);
        }
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mouseleave', onPointerLeave);
      container.removeEventListener('touchmove', onPointerMove);
      container.removeEventListener('touchend', onPointerLeave);
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
