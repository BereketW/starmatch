'use client';

import React, { useState, useEffect } from 'react';
import {
  getTransitTriggers,
  TransitTrigger,
  sealTimeCapsule,
  listTimeCapsules,
  checkCapsuleUnlockStatus,
  TimeCapsuleRecord,
} from '@/lib/viral/chaos';
import { Button } from '@/components/ui/Button';

export interface ChaosCapsuleProps {
  matchId?: string;
  pairNames?: { personA: string; personB: string };
}

export const ChaosCapsule: React.FC<ChaosCapsuleProps> = ({
  matchId,
  pairNames,
}) => {
  const [triggers, setTriggers] = useState<TransitTrigger[]>([]);
  const [selectedTriggerId, setSelectedTriggerId] = useState<string>('full_moon');
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [capsules, setCapsules] = useState<TimeCapsuleRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'seal' | 'vault'>('seal');
  const [statusNotice, setStatusNotice] = useState('');
  const [nowMs, setNowMs] = useState<number>(0);
  const [unlockedPreviewIds, setUnlockedPreviewIds] = useState<Set<string>>(new Set());

  // Safe client-side initialization avoiding SSR new Date() mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const current = Date.now();
      setNowMs(current);
      const trigList = getTransitTriggers(new Date(current));
      setTriggers(trigList);
      if (trigList.length > 0) {
        setSelectedTriggerId(trigList[0].id);
      }
      const saved = listTimeCapsules(matchId);
      setCapsules(saved);
      if (saved.length > 0) {
        setActiveTab('vault');
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [matchId]);

  const handleSeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const sealed = sealTimeCapsule({
      matchId,
      authorName: authorName.trim() || (pairNames ? pairNames.personA : 'You'),
      message: message.trim(),
      triggerId: selectedTriggerId,
      customBaseDate: nowMs ? new Date(nowMs) : undefined,
    });

    setCapsules((prev) => [sealed, ...prev]);
    setMessage('');
    setStatusNotice('Capsule sealed into celestial transit lock!');
    setActiveTab('vault');
    setTimeout(() => setStatusNotice(''), 3500);
  };

  const toggleForceUnlock = (id: string) => {
    setUnlockedPreviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedTrigger = triggers.find((t) => t.id === selectedTriggerId);

  return (
    <div className="p-6 sm:p-8 bg-white border border-[#D6D6D6] rounded-none text-[#141414] space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D6D6] pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657] flex items-center gap-1.5">
            ✦ Chaos Mode: Astral Time-Capsule
          </span>
          <h3 className="text-xl font-serif font-normal tracking-tight text-[#141414] mt-0.5">
            Planetary Transit Message Vault
          </h3>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center border border-[#D6D6D6] bg-[#F4F4F2] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('seal')}
            className={`py-1.5 px-3 text-xs font-mono uppercase tracking-[0.06em] transition-colors cursor-pointer ${
              activeTab === 'seal'
                ? 'bg-[#141414] text-[#FBFBFB] font-semibold'
                : 'text-[#575657] hover:text-[#141414]'
            }`}
          >
            Seal Note
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`py-1.5 px-3 text-xs font-mono uppercase tracking-[0.06em] transition-colors cursor-pointer border-l border-[#D6D6D6] ${
              activeTab === 'vault'
                ? 'bg-[#141414] text-[#FBFBFB] font-semibold'
                : 'text-[#575657] hover:text-[#141414]'
            }`}
          >
            Vault ({capsules.length})
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3 bg-[rgba(144,202,243,0.25)] border border-[#575657] text-xs font-mono text-[#141414]">
          ✓ {statusNotice}
        </div>
      )}

      {/* Tab 1: Seal Form */}
      {activeTab === 'seal' && (
        <form onSubmit={handleSeal} className="space-y-4">
          <p className="text-xs text-[#575657] leading-relaxed font-sans">
            Write an unvarnished confession, boundary, or future intention. It will be cryptographically locked until the exact celestial transit triggers.
          </p>

          <div className="space-y-1">
            <label
              htmlFor="capsule-author"
              className="block font-mono text-[11px] uppercase tracking-[0.08em] text-[#575657]"
            >
              Author Name or Initial (Optional)
            </label>
            <input
              id="capsule-author"
              type="text"
              value={authorName}
              placeholder={pairNames ? pairNames.personA : 'Your Name'}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-[#FBFBFB] border-b border-dashed border-[#A6A6A6] px-2 py-2 text-sm text-[#141414] placeholder-[#9B9B9B] focus:outline-none focus:border-[#141414] transition-colors"
            />
          </div>

          {/* Trigger Selection */}
          <div className="space-y-1">
            <label
              htmlFor="capsule-trigger"
              className="block font-mono text-[11px] uppercase tracking-[0.08em] text-[#141414]"
            >
              Celestial Transit Lock Trigger
            </label>
            <select
              id="capsule-trigger"
              value={selectedTriggerId}
              onChange={(e) => setSelectedTriggerId(e.target.value)}
              className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3.5 py-2.5 text-sm text-[#141414] focus:outline-none focus:border-[#141414] transition-colors font-mono cursor-pointer"
            >
              {triggers.map((t) => (
                <option key={t.id} value={t.id} className="bg-white text-[#141414]">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTrigger && (
            <div className="p-3.5 bg-[#FBFBFB] border border-[#D6D6D6] space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#141414] font-semibold block">
                Cosmic Lock Dynamics
              </span>
              <p className="text-xs text-[#575657] font-sans">{selectedTrigger.description}</p>
              <p className="text-[11px] font-mono text-[#575657]">
                Significance: {selectedTrigger.significance}
              </p>
            </div>
          )}

          {/* Message Textarea */}
          <div className="space-y-1">
            <label
              htmlFor="capsule-message"
              className="block font-mono text-[11px] uppercase tracking-[0.08em] text-[#141414]"
            >
              Message into the Void *
            </label>
            <textarea
              id="capsule-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What must be said when the skies shift? Write fearlessly..."
              className="w-full bg-[#FBFBFB] border border-[#D6D6D6] p-3 text-sm text-[#141414] placeholder-[#9B9B9B] focus:outline-none focus:border-[#141414] transition-colors font-sans"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            className="py-3 text-xs font-mono uppercase tracking-[0.08em] font-semibold min-h-[44px]"
          >
            Seal Capsule into the Cosmos →
          </Button>
        </form>
      )}

      {/* Tab 2: Sealed Capsules Shelf */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {capsules.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#575657] border border-dashed border-[#D6D6D6]">
              No sealed capsules yet for this pair. Create one to lock a message.
            </div>
          ) : (
            capsules.map((c) => {
              const status = checkCapsuleUnlockStatus(c, nowMs);
              const isForceUnlocked = unlockedPreviewIds.has(c.id);
              const unlocked = status.isUnlocked || isForceUnlocked;

              return (
                <div
                  key={c.id}
                  className="p-5 bg-[#FBFBFB] border border-[#D6D6D6] space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-2.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#141414] uppercase block">
                        {c.triggerName}
                      </span>
                      <span className="font-mono text-[10px] text-[#575657]">
                        From: {c.authorName}
                      </span>
                    </div>

                    {unlocked ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#141414] bg-[rgba(144,202,243,0.3)] border border-[#575657]/50 px-2 py-0.5">
                        ✦ Unlocked
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#141414] bg-[#F4F4F2] border border-[#D6D6D6] px-2 py-0.5">
                        🔒 {status.timeRemainingFormatted}
                      </span>
                    )}
                  </div>

                  {/* Message body */}
                  <div className="py-2">
                    {unlocked ? (
                      <blockquote className="text-sm text-[#141414] font-serif italic border-l-2 border-[#141414] pl-3 py-1">
                        &ldquo;{c.message}&rdquo;
                      </blockquote>
                    ) : (
                      <div className="relative p-3 bg-[#F4F4F2] border border-[#D6D6D6]">
                        <p className="text-xs text-[#575657] blur-[4px] select-none">
                          {c.message.length > 80
                            ? c.message.slice(0, 80)
                            : 'This message is cryptographically sealed until the transit threshold passes.'}
                        </p>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-mono text-[#141414] bg-white/90 px-2.5 py-0.5 border border-[#D6D6D6] tracking-[0.06em]">
                            🔒 Awaiting Cosmic Alignment
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dev / Preview toggle */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#575657] pt-1">
                    <span>Unlock Date: {new Date(c.unlockDate).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => toggleForceUnlock(c.id)}
                      className="text-[#575657] hover:text-[#141414] underline underline-offset-2 cursor-pointer"
                    >
                      {isForceUnlocked ? 'Hide Preview' : 'Preview Unlock'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
