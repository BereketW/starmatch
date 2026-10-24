'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export interface DailyDoDontData {
  headline: string;
  doAction: string;
  dontAction: string;
}

export interface DoDontCardProps {
  data: DailyDoDontData;
  date?: string;
  dateString?: string;
  className?: string;
  onShare?: () => void;
}

export const DoDontCard: React.FC<DoDontCardProps> = ({
  data,
  date,
  dateString,
  className = '',
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [clientDate, setClientDate] = useState<string>('Today');

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setClientDate(
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const formattedDate = date || dateString || clientDate;

  const handleCopy = async () => {
    const text = `STARMATCH DAILY PROTOCOL\nHeadline: ${data?.headline || 'Daily Alignment'}\nDO: ${data?.doAction || 'Lean into mutual respect.'}\nDON'T: ${data?.dontAction || 'Rush reactive assumptions.'}\nhttps://starmatch.app`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard write failed
    }
  };


  return (
    <div
      className={`p-6 sm:p-8 bg-white border border-[#D6D6D6] rounded-none text-[#141414] space-y-6 ${className}`.trim()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657]">
            Today&apos;s Pair Protocol
          </span>
          <h3 className="text-xl font-serif font-normal tracking-tight text-[#141414] mt-0.5">
            Do &amp; Don&apos;t for Us
          </h3>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#141414] bg-[#F4F4F2] px-2.5 py-1 border border-[#D6D6D6]">
          {formattedDate}
        </span>
      </div>

      {/* Transit Headline */}
      {data?.headline && (
        <div className="bg-[#FBFBFB] border border-[#D6D6D6] p-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#575657] block">
            Current Atmosphere
          </span>
          <p className="text-sm font-serif italic text-[#141414] tracking-wide mt-0.5">
            {data.headline}
          </p>
        </div>
      )}

      {/* Co-Star Two-Column DO & DON'T Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-[#575657]">
        {/* DO Block */}
        <div className="p-5 bg-[rgba(144,202,243,0.18)] border-b md:border-b-0 md:border-r border-[#575657] space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#575657]/40 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#141414]">
              DO
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#575657]">
              Lean Into Today
            </span>
          </div>
          <p className="text-sm text-[#141414] leading-relaxed font-sans">
            {data?.doAction || 'Offer generous emotional space and listen without quick solutions.'}
          </p>
        </div>

        {/* DON'T Block */}
        <div className="p-5 bg-[rgba(243,144,144,0.18)] space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#575657]/40 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#141414]">
              DON&apos;T
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#575657]">
              Avoid Friction Today
            </span>
          </div>
          <p className="text-sm text-[#141414] leading-relaxed font-sans">
            {data?.dontAction || 'Critique timing or interpret quiet contemplation as withdrawal.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="flex-1 min-h-[44px]"
        >
          {copied ? '✓ Protocol Copied' : 'Copy Daily Protocol'}
        </Button>
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex-1 min-h-[44px]"
          >
            Share Card
          </Button>
        )}
      </div>
    </div>
  );
};
