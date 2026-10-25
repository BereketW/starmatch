import { SynastryResult } from '@/lib/synastry/types';
import { getOneSharpTruth } from '@/lib/report/composer';

export type CardFormat = '9:16' | '1:1';

export interface ShareCardDimensions {
  width: number;
  height: number;
}

export const CARD_DIMENSIONS: Record<CardFormat, ShareCardDimensions> = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
};

export interface RenderShareCardOptions {
  synastry: SynastryResult;
  format: CardFormat;
  customTitle?: string;
  theme?: 'dark' | 'light';
  watermark?: boolean;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Pure SVG generator for high-contrast viral share cards.
 * Produces crisp, vector-scaled graphics in both 9:16 and 1:1 dimensions.
 */
export function generateShareCardSvg(options: RenderShareCardOptions): string {
  const { synastry, format } = options;

  const nameA = escapeXml(synastry.personA?.name?.trim() || synastry.personA?.zodiacSign || 'You');
  const nameB = escapeXml(synastry.personB?.name?.trim() || synastry.personB?.zodiacSign || 'Them');
  const signA = escapeXml(synastry.personA?.zodiacSign || 'NATAL');
  const signB = escapeXml(synastry.personB?.zodiacSign || 'NATAL');
  const relType = escapeXml((synastry.relationshipType || 'romantic').toUpperCase());
  const score = synastry.overallScore ?? 50;

  const sharpTruth = getOneSharpTruth(synastry);
  const sharpTruthHeadline = escapeXml(sharpTruth.headline);
  const sharpTruthQuote = escapeXml(
    sharpTruth.quote.length > 110 ? sharpTruth.quote.slice(0, 107) + '...' : sharpTruth.quote
  );

  const doAction = escapeXml(
    synastry.dailyDoDont?.doAction || 'Offer generous emotional space and listen without quick solutions.'
  );
  const dontAction = escapeXml(
    synastry.dailyDoDont?.dontAction || 'Critique timing or interpret quiet contemplation as withdrawal.'
  );

  const categories = synastry.categories || {
    chemistry: 75,
    communication: 70,
    emotionalBond: 80,
    conflictStyle: 65,
    longTermPotential: 85,
  };

  const isLight = (options.theme ?? 'light') === 'light';
  const showWatermark = options.watermark !== false;
  const bgStart = isLight ? '#ffffff' : '#050505';
  const bgMid = isLight ? '#f4f4f5' : '#0a0a0c';
  const bgEnd = isLight ? '#f4f4f2' : '#000000';
  const strokeColor = isLight ? '#141414' : '#27272a';
  const hairlineColor = isLight ? '#d6d6d6' : '#27272a';
  const cardFill = isLight ? '#ffffff' : '#0d0d0f';
  const subtleFill = isLight ? '#f4f4f5' : '#18181b';
  const textPrimary = isLight ? '#141414' : '#ffffff';
  const textSecondary = isLight ? '#3f3f46' : '#e4e4e7';
  const textMuted = isLight ? '#575657' : '#a1a1aa';
  const barTrack = isLight ? '#e4e4e7' : '#27272a';
  const doCardBg = isLight ? '#eef6fc' : '#061e14';
  const doCardBorder = isLight ? '#141414' : '#10b981';
  const doBadgeBg = isLight ? '#141414' : '#10b981';
  const doBadgeText = isLight ? '#ffffff' : '#000000';
  const doLabelText = isLight ? '#141414' : '#10b981';
  const dontCardBg = isLight ? '#fdf2f2' : '#210808';
  const dontCardBorder = isLight ? '#141414' : '#ef4444';
  const dontBadgeBg = isLight ? '#141414' : '#ef4444';
  const dontBadgeText = '#ffffff';
  const dontLabelText = isLight ? '#575657' : '#ef4444';

  if (format === '9:16') {
    // 1080 x 1920 Vertical Story / Reel (Co-Star Light Editorial Default)
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="50%" stop-color="${bgMid}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#bgGrad)"/>

  <!-- Co-Star Architectural Hairline Border & Frame -->
  <rect x="40" y="40" width="1000" height="1840" fill="none" stroke="${strokeColor}" stroke-width="2"/>
  <rect x="56" y="56" width="968" height="1808" fill="none" stroke="${hairlineColor}" stroke-width="1"/>

  <!-- Top Metadata Header -->
  <text x="540" y="135" fill="${textMuted}" font-family="monospace, monospace" font-size="20" font-weight="600" letter-spacing="8" text-anchor="middle">STARMATCH • 0.1° EPHEMERIS PRECISION</text>
  <rect x="430" y="165" width="220" height="36" fill="${subtleFill}" stroke="${strokeColor}" stroke-width="1"/>
  <text x="540" y="189" fill="${textPrimary}" font-family="monospace, monospace" font-size="14" font-weight="600" letter-spacing="3" text-anchor="middle">${relType} SYNASTRY</text>

  <!-- Names Hero -->
  <text x="540" y="290" fill="${textPrimary}" font-family="Georgia, serif" font-size="64" font-weight="400" letter-spacing="-1" text-anchor="middle">
    ${nameA} <tspan fill="${textMuted}" font-style="italic">&amp;</tspan> ${nameB}
  </text>
  <text x="540" y="340" fill="${textMuted}" font-family="monospace, monospace" font-size="22" letter-spacing="4" text-anchor="middle">
    ${signA} • ${signB}
  </text>

  <!-- Giant Score Gauge Box -->
  <g transform="translate(140, 400)">
    <rect width="800" height="340" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>
    <text x="400" y="65" fill="${textMuted}" font-family="monospace, monospace" font-size="16" letter-spacing="4" text-anchor="middle">OVERALL RESONANCE</text>
    <text x="400" y="210" fill="${textPrimary}" font-family="Georgia, serif" font-size="140" font-weight="400" letter-spacing="-4" text-anchor="middle">
      ${score}<tspan font-size="70" fill="${textMuted}">%</tspan>
    </text>
    <rect x="150" y="260" width="500" height="6" fill="${barTrack}"/>
    <rect x="150" y="260" width="${Math.round(500 * (score / 100))}" height="6" fill="${textPrimary}"/>
    <text x="400" y="302" fill="${textMuted}" font-family="monospace, monospace" font-size="14" letter-spacing="2" text-anchor="middle">CALCULATED FROM 10 PLANETARY BODIES + NODES</text>
  </g>

  <!-- One Sharp Truth Card -->
  <g transform="translate(140, 780)">
    <rect width="800" height="260" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>
    <text x="40" y="50" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" font-weight="700" letter-spacing="3">✦ THE ONE SHARP TRUTH</text>
    <text x="40" y="100" fill="${textPrimary}" font-family="monospace, monospace" font-size="22" font-weight="700">${sharpTruthHeadline}</text>
    <line x1="40" y1="125" x2="40" y2="215" stroke="${textPrimary}" stroke-width="3"/>
    <text x="60" y="165" fill="${textSecondary}" font-family="Georgia, serif" font-size="22" font-style="italic">
      &ldquo;${sharpTruthQuote}&rdquo;
    </text>
  </g>

  <!-- 5 SRS Dimension Bars -->
  <g transform="translate(140, 1080)">
    <rect width="800" height="360" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>
    <text x="40" y="45" fill="${textMuted}" font-family="monospace, monospace" font-size="15" letter-spacing="3">PSYCHOLOGICAL CORE BUCKETS</text>

    <!-- Bar 1: Chemistry -->
    <text x="40" y="95" fill="${textSecondary}" font-family="monospace, monospace" font-size="16">CHEMISTRY</text>
    <text x="760" y="95" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" text-anchor="end">${categories.chemistry}%</text>
    <rect x="40" y="110" width="720" height="6" fill="${barTrack}"/>
    <rect x="40" y="110" width="${Math.round(720 * (categories.chemistry / 100))}" height="6" fill="${textPrimary}"/>

    <!-- Bar 2: Communication -->
    <text x="40" y="150" fill="${textSecondary}" font-family="monospace, monospace" font-size="16">COMMUNICATION</text>
    <text x="760" y="150" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" text-anchor="end">${categories.communication}%</text>
    <rect x="40" y="165" width="720" height="6" fill="${barTrack}"/>
    <rect x="40" y="165" width="${Math.round(720 * (categories.communication / 100))}" height="6" fill="${textPrimary}"/>

    <!-- Bar 3: Emotional Bond -->
    <text x="40" y="205" fill="${textSecondary}" font-family="monospace, monospace" font-size="16">EMOTIONAL BOND</text>
    <text x="760" y="205" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" text-anchor="end">${categories.emotionalBond}%</text>
    <rect x="40" y="220" width="720" height="6" fill="${barTrack}"/>
    <rect x="40" y="220" width="${Math.round(720 * (categories.emotionalBond / 100))}" height="6" fill="${textPrimary}"/>

    <!-- Bar 4: Conflict Style -->
    <text x="40" y="260" fill="${textSecondary}" font-family="monospace, monospace" font-size="16">CONFLICT STYLE</text>
    <text x="760" y="260" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" text-anchor="end">${categories.conflictStyle}%</text>
    <rect x="40" y="275" width="720" height="6" fill="${barTrack}"/>
    <rect x="40" y="275" width="${Math.round(720 * (categories.conflictStyle / 100))}" height="6" fill="${textPrimary}"/>

    <!-- Bar 5: Long-term -->
    <text x="40" y="315" fill="${textSecondary}" font-family="monospace, monospace" font-size="16">LONG-TERM POTENTIAL</text>
    <text x="760" y="315" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" text-anchor="end">${categories.longTermPotential}%</text>
    <rect x="40" y="330" width="720" height="6" fill="${barTrack}"/>
    <rect x="40" y="330" width="${Math.round(720 * (categories.longTermPotential / 100))}" height="6" fill="${textPrimary}"/>
  </g>

  <!-- Do & Don't Split Cards -->
  <g transform="translate(140, 1480)">
    <!-- DO Card -->
    <rect x="0" y="0" width="385" height="210" fill="${doCardBg}" stroke="${doCardBorder}" stroke-width="1.5"/>
    <rect x="24" y="20" width="54" height="26" fill="${doBadgeBg}"/>
    <text x="51" y="38" fill="${doBadgeText}" font-family="monospace, monospace" font-size="14" font-weight="700" text-anchor="middle">DO</text>
    <text x="90" y="38" fill="${doLabelText}" font-family="monospace, monospace" font-size="14" font-weight="600">DAILY PROTOCOL</text>
    <text x="24" y="88" width="337" fill="${textPrimary}" font-family="Georgia, serif" font-size="18">
      ${doAction.length > 70 ? doAction.slice(0, 67) + '...' : doAction}
    </text>

    <!-- DON'T Card -->
    <rect x="415" y="0" width="385" height="210" fill="${dontCardBg}" stroke="${dontCardBorder}" stroke-width="1.5"/>
    <rect x="439" y="20" width="74" height="26" fill="${dontBadgeBg}"/>
    <text x="476" y="38" fill="${dontBadgeText}" font-family="monospace, monospace" font-size="14" font-weight="700" text-anchor="middle">DON&apos;T</text>
    <text x="525" y="38" fill="${dontLabelText}" font-family="monospace, monospace" font-size="14" font-weight="600">AVOID TODAY</text>
    <text x="439" y="88" width="337" fill="${textPrimary}" font-family="Georgia, serif" font-size="18">
      ${dontAction.length > 70 ? dontAction.slice(0, 67) + '...' : dontAction}
    </text>
  </g>

  ${showWatermark ? `
  <!-- Footer Watermark -->
  <text x="540" y="1760" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" font-weight="700" letter-spacing="4" text-anchor="middle">CROSS YOUR STARS AT STARMATCH.APP</text>
  <text x="540" y="1795" fill="${textMuted}" font-family="monospace, monospace" font-size="13" letter-spacing="2" text-anchor="middle">NO LOGIN REQUIRED • 100% DETERMINISTIC</text>` : ''}
</svg>
`.trim();
  }

  // 1:1 (1080 x 1080) Square Post / Feed Card (Co-Star Light Editorial Default)
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bgGradSq" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="50%" stop-color="${bgMid}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#bgGradSq)"/>
  <rect x="30" y="30" width="1020" height="1020" fill="none" stroke="${strokeColor}" stroke-width="2"/>

  <!-- Header -->
  <text x="540" y="85" fill="${textMuted}" font-family="monospace, monospace" font-size="16" font-weight="600" letter-spacing="6" text-anchor="middle">STARMATCH • 0.1° EPHEMERIS PRECISION</text>

  <!-- Names Hero -->
  <text x="540" y="170" fill="${textPrimary}" font-family="Georgia, serif" font-size="52" font-weight="400" letter-spacing="-1" text-anchor="middle">
    ${nameA} <tspan fill="${textMuted}" font-style="italic">&amp;</tspan> ${nameB}
  </text>
  <text x="540" y="210" fill="${textMuted}" font-family="monospace, monospace" font-size="18" letter-spacing="3" text-anchor="middle">
    ${signA} • ${signB} &bull; ${relType}
  </text>

  <!-- Center Row: Big Score Box + Truth -->
  <g transform="translate(80, 250)">
    <!-- Score Box (Left) -->
    <rect x="0" y="0" width="440" height="340" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>
    <text x="220" y="60" fill="${textMuted}" font-family="monospace, monospace" font-size="14" letter-spacing="3" text-anchor="middle">OVERALL RESONANCE</text>
    <text x="220" y="200" fill="${textPrimary}" font-family="Georgia, serif" font-size="120" font-weight="400" letter-spacing="-3" text-anchor="middle">
      ${score}<tspan font-size="50" fill="${textMuted}">%</tspan>
    </text>
    <rect x="70" y="250" width="300" height="6" fill="${barTrack}"/>
    <rect x="70" y="250" width="${Math.round(300 * (score / 100))}" height="6" fill="${textPrimary}"/>
    <text x="220" y="290" fill="${textMuted}" font-family="monospace, monospace" font-size="12" letter-spacing="2" text-anchor="middle">DETERMINISTIC SYNASTRY</text>

    <!-- Truth Box (Right) -->
    <rect x="480" y="0" width="440" height="340" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>
    <text x="510" y="55" fill="${textPrimary}" font-family="monospace, monospace" font-size="14" font-weight="700" letter-spacing="3">✦ ONE SHARP TRUTH</text>
    <text x="510" y="105" fill="${textPrimary}" font-family="monospace, monospace" font-size="18" font-weight="700">${sharpTruthHeadline}</text>
    <line x1="510" y1="130" x2="510" y2="280" stroke="${textPrimary}" stroke-width="3"/>
    <text x="528" y="170" fill="${textSecondary}" font-family="Georgia, serif" font-size="18" font-style="italic">
      &ldquo;${sharpTruthQuote}&rdquo;
    </text>
  </g>

  <!-- Categories Horizontal Breakdown -->
  <g transform="translate(80, 620)">
    <rect width="920" height="230" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>
    <text x="40" y="45" fill="${textMuted}" font-family="monospace, monospace" font-size="14" letter-spacing="3">DIMENSION SCORES</text>

    <text x="40" y="90" fill="${textPrimary}" font-family="monospace, monospace" font-size="14">CHEMISTRY</text>
    <text x="430" y="90" fill="${textPrimary}" font-family="monospace, monospace" font-size="14" text-anchor="end">${categories.chemistry}%</text>
    <rect x="40" y="102" width="390" height="6" fill="${barTrack}"/>
    <rect x="40" y="102" width="${Math.round(390 * (categories.chemistry / 100))}" height="6" fill="${textPrimary}"/>

    <text x="490" y="90" fill="${textPrimary}" font-family="monospace, monospace" font-size="14">COMMUNICATION</text>
    <text x="880" y="90" fill="${textPrimary}" font-family="monospace, monospace" font-size="14" text-anchor="end">${categories.communication}%</text>
    <rect x="490" y="102" width="390" height="6" fill="${barTrack}"/>
    <rect x="490" y="102" width="${Math.round(390 * (categories.communication / 100))}" height="6" fill="${textPrimary}"/>

    <text x="40" y="150" fill="${textPrimary}" font-family="monospace, monospace" font-size="14">EMOTIONAL BOND</text>
    <text x="430" y="150" fill="${textPrimary}" font-family="monospace, monospace" font-size="14" text-anchor="end">${categories.emotionalBond}%</text>
    <rect x="40" y="162" width="390" height="6" fill="${barTrack}"/>
    <rect x="40" y="162" width="${Math.round(390 * (categories.emotionalBond / 100))}" height="6" fill="${textPrimary}"/>

    <text x="490" y="150" fill="${textPrimary}" font-family="monospace, monospace" font-size="14">LONG-TERM POTENTIAL</text>
    <text x="880" y="150" fill="${textPrimary}" font-family="monospace, monospace" font-size="14" text-anchor="end">${categories.longTermPotential}%</text>
    <rect x="490" y="162" width="390" height="6" fill="${barTrack}"/>
    <rect x="490" y="162" width="${Math.round(390 * (categories.longTermPotential / 100))}" height="6" fill="${textPrimary}"/>
  </g>

  ${showWatermark ? `
  <!-- Bottom CTA -->
  <g transform="translate(80, 880)">
    <rect width="920" height="100" fill="${subtleFill}" stroke="${strokeColor}" stroke-width="1.5"/>
    <text x="460" y="45" fill="${textPrimary}" font-family="monospace, monospace" font-size="16" font-weight="700" letter-spacing="4" text-anchor="middle">CROSS YOUR STARS AT STARMATCH.APP</text>
    <text x="460" y="75" fill="${textMuted}" font-family="monospace, monospace" font-size="13" letter-spacing="2" text-anchor="middle">INSTANT ACCOUNT-FREE SYNASTRY REPORT</text>
  </g>` : ''}
</svg>
`.trim();
}

/**
 * Converts SVG string into an encoded SVG data URL.
 * Works seamlessly across both Node.js (SSR / Vitest) and browsers.
 */
export function svgToDataUrl(svgString: string): string {
  if (typeof Buffer !== 'undefined') {
    const base64 = Buffer.from(svgString).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
  // Browser fallback
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

/**
 * Renders a high-DPI viral share card.
 * In a browser with Canvas 2D support, loads SVG into an image and draws to Canvas for PNG export.
 * In Node or environments without document/Canvas, returns an SVG data URL fallback.
 */
export async function renderShareCard(options: RenderShareCardOptions): Promise<string> {
  const svg = generateShareCardSvg(options);
  const { width, height } = CARD_DIMENSIONS[options.format];

  // If in Node / headless / no document available, return SVG data URL
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return svgToDataUrl(svg);
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return svgToDataUrl(svg);
    }

    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, width, height);
          const pngUrl = canvas.toDataURL('image/png');
          resolve(pngUrl);
        } catch {
          resolve(svgToDataUrl(svg));
        }
      };

      img.onerror = () => {
        resolve(svgToDataUrl(svg));
      };

      img.src = svgUrl;
    });
  } catch {
    return svgToDataUrl(svg);
  }
}

/**
 * Triggers a client-side download of a rendered share card.
 */
export function downloadShareCard(dataUrl: string, filename: string): void {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Native Web Share API helper with fallback.
 */
export async function shareCard(options: {
  title: string;
  text: string;
  url?: string;
  dataUrl?: string;
}): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    const shareData: ShareData = {
      title: options.title,
      text: options.text,
      url: options.url || (typeof window !== 'undefined' ? window.location.href : undefined),
    };

    // If files sharing is supported and dataUrl is provided
    if (options.dataUrl && navigator.canShare && options.dataUrl.startsWith('data:image/')) {
      try {
        const res = await fetch(options.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'starmatch-card.png', { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch {
        // Fallback to text share
      }
    }

    await navigator.share(shareData);
    return true;
  } catch {
    return false;
  }
}
