'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SynastryResult } from '@/lib/synastry/types';
import {
  CardFormat,
  renderShareCard,
  generateShareCardSvg,
  svgToDataUrl,
  downloadShareCard,
  shareCard,
} from '@/lib/share/card-renderer';

export interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  synastry: SynastryResult;
  matchId?: string;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  synastry,
  matchId,
}) => {
  const [format, setFormat] = useState<CardFormat>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const nameA = synastry.personA?.name?.trim() || synastry.personA?.zodiacSign || 'You';
  const nameB = synastry.personB?.name?.trim() || synastry.personB?.zodiacSign || 'Them';

  // Compute preview when format or synastry changes
  const previewDataUrl = useMemo(() => {
    if (!isOpen) return '';
    const svg = generateShareCardSvg({ synastry, format, theme: 'light' });
    return svgToDataUrl(svg);
  }, [isOpen, format, synastry]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await renderShareCard({ synastry, format, theme: 'light' });
      const filename = `starmatch-${nameA.toLowerCase().replace(/\s+/g, '-')}-x-${nameB.toLowerCase().replace(/\s+/g, '-')}-${format.replace(':', 'x')}.png`;
      downloadShareCard(dataUrl, filename);
    } catch {
      // Fallback: download SVG preview
      if (previewDataUrl) {
        downloadShareCard(previewDataUrl, `starmatch-share-${format.replace(':', 'x')}.svg`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await renderShareCard({ synastry, format, theme: 'light' });
      const shareUrl =
        typeof window !== 'undefined'
          ? matchId
            ? `${window.location.origin}/match/${matchId}`
            : window.location.href
          : 'https://starmatch.app';

      const shared = await shareCard({
        title: `${nameA} × ${nameB} (${synastry.overallScore}%) — StarMatch`,
        text: `Our synastry compatibility is ${synastry.overallScore}%. Calculated with 0.1° ephemeris precision.`,
        url: shareUrl,
        dataUrl,
      });

      if (!shared) {
        // Fallback to copy link
        await handleCopyLink();
      }
    } catch {
      await handleCopyLink();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const url = matchId
        ? `${window.location.origin}/match/${matchId}`
        : window.location.href;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Card Studio"
      maxWidth="lg"
      className="max-h-[90vh] flex flex-col"
    >
      <div className="space-y-5">
        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-[#D6D6D6] pb-3">
          <button
            type="button"
            onClick={() => setFormat('9:16')}
            className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-[0.06em] border transition-colors cursor-pointer text-center ${
              format === '9:16'
                ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
                : 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6] hover:text-[#141414]'
            }`}
          >
            9:16 Story / Reel (1080×1920)
          </button>
          <button
            type="button"
            onClick={() => setFormat('1:1')}
            className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-[0.06em] border transition-colors cursor-pointer text-center ${
              format === '1:1'
                ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
                : 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6] hover:text-[#141414]'
            }`}
          >
            1:1 Post / Square (1080×1080)
          </button>
        </div>

        {/* Live Card Preview Box */}
        <div className="w-full flex items-center justify-center bg-[#F4F4F2] border border-[#D6D6D6] p-3 sm:p-4 overflow-hidden max-h-[460px]">
          {previewDataUrl ? (
            <div
              className={`relative overflow-hidden shadow-lg transition-all duration-300 border border-[#141414] ${
                format === '9:16'
                  ? 'h-[420px] aspect-[9/16]'
                  : 'h-[360px] aspect-square'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewDataUrl}
                alt={`StarMatch compatibility card for ${nameA} and ${nameB}`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="h-[360px] flex items-center justify-center text-xs font-mono text-[#575657]">
              Generating card preview...
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full font-mono text-xs uppercase tracking-[0.06em] font-semibold min-h-[44px]"
          >
            {isGenerating ? 'Rendering...' : 'Download PNG'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full font-mono text-xs uppercase tracking-[0.06em] min-h-[44px]"
          >
            Share to Social
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleCopyLink}
            className="w-full font-mono text-xs uppercase tracking-[0.06em] border border-[#D6D6D6] min-h-[44px]"
          >
            {copiedLink ? '✓ Copied Link' : 'Copy Link'}
          </Button>
        </div>

        <p className="text-[11px] font-mono text-center text-[#575657] uppercase tracking-[0.06em]">
          High-DPI vector export • Co-Star × Spotify Wrapped editorial design
        </p>
      </div>
    </Modal>
  );
};
