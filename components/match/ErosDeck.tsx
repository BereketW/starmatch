'use client';

import React, { useState, useMemo } from 'react';
import { SynastryResult } from '@/lib/synastry/types';
import { generateErosDeck, ErosCard, ErosCategory } from '@/lib/viral/eros';
import { Button } from '@/components/ui/Button';

export interface ErosDeckProps {
  synastry: SynastryResult;
}

export const ErosDeck: React.FC<ErosDeckProps> = ({ synastry }) => {
  const [selectedCategory, setSelectedCategory] = useState<ErosCategory | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const allCards = useMemo(() => generateErosDeck(synastry), [synastry]);

  const filteredCards = useMemo(() => {
    if (selectedCategory === 'all') return allCards;
    return allCards.filter((c) => c.category === selectedCategory);
  }, [allCards, selectedCategory]);

  const activeIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
  const currentCard: ErosCard | undefined = filteredCards[activeIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleSelectCategory = (cat: ErosCategory | 'all') => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleCopy = async () => {
    if (!currentCard) return;
    const text = `STARMATCH EROS DECK — ${currentCard.title}\nCategory: ${currentCard.categoryLabel}\nPlanetary Driver: ${currentCard.planetaryDriver}\n\nPROMPT:\n"${currentCard.prompt}"\n\nACTIONABLE PROTOCOL:\n${currentCard.actionableProtocol}\n\nhttps://starmatch.app`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore
    }
  };

  if (!currentCard) return null;

  return (
    <div className="p-6 sm:p-8 bg-white border border-[#D6D6D6] rounded-none text-[#141414] space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D6D6] pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657] flex items-center gap-1.5">
            ✦ Eros Relationship Deck
          </span>
          <h3 className="text-xl font-serif font-normal tracking-tight text-[#141414] mt-0.5">
            Tactical Intimacy &amp; Conflict Protocols
          </h3>
        </div>

        {/* Counter */}
        <span className="font-mono text-[11px] text-[#141414] uppercase tracking-[0.06em] self-start sm:self-auto bg-[#F4F4F2] px-2.5 py-1 border border-[#D6D6D6]">
          Card 0{activeIndex + 1} / 0{filteredCards.length}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => handleSelectCategory('all')}
          className={`py-1.5 px-3 border text-xs font-mono uppercase tracking-[0.06em] transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
              : 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          All ({allCards.length})
        </button>
        <button
          type="button"
          onClick={() => handleSelectCategory('intimacy')}
          className={`py-1.5 px-3 border text-xs font-mono uppercase tracking-[0.06em] transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'intimacy'
              ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
              : 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          Intimacy
        </button>
        <button
          type="button"
          onClick={() => handleSelectCategory('conflict_repair')}
          className={`py-1.5 px-3 border text-xs font-mono uppercase tracking-[0.06em] transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'conflict_repair'
              ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
              : 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          Repair
        </button>
        <button
          type="button"
          onClick={() => handleSelectCategory('how_to_argue')}
          className={`py-1.5 px-3 border text-xs font-mono uppercase tracking-[0.06em] transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'how_to_argue'
              ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
              : 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          How to Argue
        </button>
        <button
          type="button"
          onClick={() => handleSelectCategory('note_from_the_void')}
          className={`py-1.5 px-3 border text-xs font-mono uppercase tracking-[0.06em] transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'note_from_the_void'
              ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
              : 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          Void Notes
        </button>
      </div>

      {/* Interactive Card Canvas */}
      <div
        className="min-h-[260px] p-6 sm:p-7 bg-[#FBFBFB] border border-[#141414] relative flex flex-col justify-between cursor-pointer group transition-all duration-200"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          /* Card Front */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-2.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#141414] font-semibold">
                {currentCard.categoryLabel}
              </span>
              <span className="font-mono text-[10px] text-[#575657] uppercase tracking-[0.06em]">
                {currentCard.planetaryDriver}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <h4 className="text-lg sm:text-xl font-serif font-normal tracking-tight text-[#141414]">
                {currentCard.title}
              </h4>
              <p className="text-sm sm:text-base text-[#141414] leading-relaxed font-serif italic border-l-2 border-[#141414] pl-4 py-1">
                &ldquo;{currentCard.prompt}&rdquo;
              </p>
            </div>

            <div className="pt-3 flex items-center justify-between text-[11px] font-mono text-[#575657]">
              <span>Tap to reveal Actionable Protocol</span>
              <span className="text-[#141414] font-semibold group-hover:translate-x-0.5 transition-transform">
                Flip →
              </span>
            </div>
          </div>
        ) : (
          /* Card Back / Action Protocol */
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-2.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657] font-semibold">
                Action Protocol
              </span>
              <span className="font-mono text-[10px] text-[#141414] uppercase tracking-[0.06em]">
                ✦ Practice Today
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-sm text-[#141414] leading-relaxed font-sans">
                {currentCard.actionableProtocol}
              </p>

              {currentCard.shadowWarning && (
                <div className="p-3 bg-[rgba(243,144,144,0.2)] border border-[#575657]/50">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#141414] block font-semibold">
                    Shadow Trap
                  </span>
                  <p className="text-xs text-[#575657] leading-tight mt-0.5 font-sans">
                    {currentCard.shadowWarning}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#575657]">
              <span>Tap to return to prompt</span>
              <span className="text-[#141414] font-semibold">← Back</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Navigation and Copy Buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            className="border border-[#D6D6D6] font-mono text-xs px-3"
            aria-label="Previous card"
          >
            ← Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="border border-[#D6D6D6] font-mono text-xs px-3"
            aria-label="Next card"
          >
            Next →
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="font-mono text-xs uppercase tracking-[0.06em]"
        >
          {copied ? '✓ Protocol Copied' : 'Copy Protocol'}
        </Button>
      </div>
    </div>
  );
};
