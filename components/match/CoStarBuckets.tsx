import React from 'react';
import { CoStarBuckets as CoStarBucketsData } from '@/lib/synastry/types';

export interface CoStarBucketsProps {
  buckets: CoStarBucketsData;
  className?: string;
}

interface BucketMeta {
  key: keyof CoStarBucketsData;
  title: string;
  glyph: string;
  planet: string;
  synthesis: string;
}

const BUCKET_META: BucketMeta[] = [
  {
    key: 'basicIdentities',
    title: 'Basic Identities',
    glyph: '☉',
    planet: 'Sun & Rising',
    synthesis: 'Core egos, vital willpower, and instinctive persona expression.',
  },
  {
    key: 'howYouLove',
    title: 'How You Love',
    glyph: '♀',
    planet: 'Venus Polarity',
    synthesis: 'Romantic generosity, aesthetic values, and affection language.',
  },
  {
    key: 'sexAndAggression',
    title: 'Sex & Aggression',
    glyph: '♂',
    planet: 'Mars Energy',
    synthesis: 'Physical passion, drive, assertion velocity, and conflict triggers.',
  },
  {
    key: 'moodsAndEmotions',
    title: 'Moods & Emotions',
    glyph: '☽',
    planet: 'Luminaries & Moon',
    synthesis: 'Subconscious security, intuitive pacing, and vulnerability.',
  },
  {
    key: 'philosophy',
    title: 'Philosophy',
    glyph: '♃',
    planet: 'Jupiterian Horizon',
    synthesis: 'Shared worldview, intellectual optimism, and ethical alignment.',
  },
  {
    key: 'responsibility',
    title: 'Responsibility',
    glyph: '♄',
    planet: 'Saturnian Limits',
    synthesis: 'Accountability, structural patience, and commitment endurance.',
  },
  {
    key: 'imagination',
    title: 'Imagination',
    glyph: '♆',
    planet: 'Neptune & Uranus',
    synthesis: 'Creative fantasy, psychic resonance, and transcendent ideals.',
  },
];

export const CoStarBuckets: React.FC<CoStarBucketsProps> = ({
  buckets,
  className = '',
}) => {
  return (
    <div
      className={`p-6 sm:p-8 bg-white border border-[#D6D6D6] rounded-none text-[#141414] space-y-6 ${className}`.trim()}
    >
      <div className="border-b border-[#D6D6D6] pb-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657]">
          Psychological Architecture
        </span>
        <h3 className="text-xl font-serif font-normal tracking-tight text-[#141414] mt-1">
          7 Co-Star Synastry Domains
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#D6D6D6]">
        {BUCKET_META.map(({ key, title, glyph, planet, synthesis }) => {
          const rawVal = buckets ? buckets[key] : 50;
          const score = Math.min(100, Math.max(0, Math.round(typeof rawVal === 'number' ? rawVal : 50)));

          // Calculate 5-segment meter
          const activeSegments = Math.min(5, Math.max(1, Math.ceil(score / 20)));

          return (
            <div
              key={key}
              className="p-4 sm:p-5 bg-[#FBFBFB] border-r border-b border-[#D6D6D6] flex flex-col justify-between space-y-3 hover:bg-white transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#575657] uppercase tracking-[0.06em]">
                  <span className="flex items-center gap-1.5 text-[#575657]">
                    <span className="text-[#141414] font-sans text-sm">{glyph}</span>
                    <span>{planet}</span>
                  </span>
                  <span className="font-semibold text-[#141414] tabular-nums">
                    {score}%
                  </span>
                </div>

                <h4 className="text-base font-serif font-normal tracking-tight text-[#141414] mt-1.5">
                  {title}
                </h4>

                <p className="text-xs text-[#575657] leading-relaxed mt-1 font-sans">
                  {synthesis}
                </p>
              </div>

              {/* 5-segment meter */}
              <div
                className="flex items-center gap-1.5 pt-1"
                role="meter"
                aria-label={`${title} score`}
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {[1, 2, 3, 4, 5].map((segIndex) => (
                  <div
                    key={segIndex}
                    className={`h-1.5 flex-1 transition-colors ${
                      segIndex <= activeSegments
                        ? 'bg-[#141414]'
                        : 'bg-[#E2E2E0]'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
