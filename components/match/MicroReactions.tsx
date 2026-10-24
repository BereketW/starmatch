'use client';

import React, { useState, useEffect } from 'react';

export type ReactionType = 'love' | 'laugh' | 'thug' | 'down';

export interface MicroReactionsProps {
  targetId: string;
  initialCounts?: Partial<Record<ReactionType, number>>;
  className?: string;
  label?: string;
}

const REACTION_CONFIG: Record<
  ReactionType,
  { label: string; icon: string; defaultCount: number }
> = {
  love: { label: 'Love', icon: '❤️', defaultCount: 12 },
  laugh: { label: 'Laugh', icon: '😂', defaultCount: 5 },
  thug: { label: 'Real', icon: '🕶️', defaultCount: 19 },
  down: { label: 'Heavy', icon: '👎', defaultCount: 3 },
};

export const MicroReactions: React.FC<MicroReactionsProps> = ({
  targetId,
  initialCounts = {},
  className = '',
  label = 'Reading Resonance',
}) => {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [counts, setCounts] = useState<Record<ReactionType, number>>(() => ({
    love: initialCounts.love ?? REACTION_CONFIG.love.defaultCount,
    laugh: initialCounts.laugh ?? REACTION_CONFIG.laugh.defaultCount,
    thug: initialCounts.thug ?? REACTION_CONFIG.thug.defaultCount,
    down: initialCounts.down ?? REACTION_CONFIG.down.defaultCount,
  }));

  // Safely hydrate from localStorage on mount (SSR safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const frame = requestAnimationFrame(() => {
      try {
        const storedReaction = localStorage.getItem(`starmatch_react_${targetId}`) as ReactionType | null;
        if (storedReaction && Object.keys(REACTION_CONFIG).includes(storedReaction)) {
          setUserReaction(storedReaction);
        }
        const storedCounts = localStorage.getItem(`starmatch_counts_${targetId}`);
        if (storedCounts) {
          setCounts(JSON.parse(storedCounts));
        }
      } catch {
        // Storage unavailable
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [targetId]);

  const handleToggleReaction = (type: ReactionType) => {
    setCounts((prev) => {
      const updated = { ...prev };
      let nextReaction: ReactionType | null = type;

      if (userReaction === type) {
        // Untoggle
        updated[type] = Math.max(0, updated[type] - 1);
        nextReaction = null;
      } else {
        // Toggle new, untoggle old if exists
        if (userReaction) {
          updated[userReaction] = Math.max(0, updated[userReaction] - 1);
        }
        updated[type] = updated[type] + 1;
      }

      setUserReaction(nextReaction);

      // Persist to localStorage
      try {
        if (typeof window !== 'undefined') {
          if (nextReaction) {
            localStorage.setItem(`starmatch_react_${targetId}`, nextReaction);
          } else {
            localStorage.removeItem(`starmatch_react_${targetId}`);
          }
          localStorage.setItem(`starmatch_counts_${targetId}`, JSON.stringify(updated));
        }
      } catch {
        // Storage error ignored
      }

      return updated;
    });
  };

  const reactionKeys: ReactionType[] = ['love', 'laugh', 'thug', 'down'];

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 ${className}`.trim()}>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#575657] mr-1">
          {label}:
        </span>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        {reactionKeys.map((type) => {
          const cfg = REACTION_CONFIG[type];
          const isSelected = userReaction === type;
          const count = counts[type];

          return (
            <button
              key={type}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleToggleReaction(type)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all duration-150 cursor-pointer border ${
                isSelected
                  ? 'bg-[#141414] text-[#FBFBFB] font-bold border-[#141414]'
                  : 'bg-[#FBFBFB] text-[#141414] border-[#D6D6D6] hover:border-[#141414] hover:bg-[#F4F4F2]'
              }`}
            >
              <span className="text-sm leading-none" role="img" aria-label={cfg.label}>
                {cfg.icon}
              </span>
              <span className="text-[11px] font-semibold">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
