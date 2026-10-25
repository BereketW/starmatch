'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RelationshipType } from '@/lib/astro/types';
import { PersonFormData, PersonInputCard } from '@/components/home/PersonInputCard';
import { RelationshipTypeSelector } from '@/components/home/RelationshipTypeSelector';
import { Button } from '@/components/ui/Button';
import { EditorialFooter } from '@/components/home/EditorialFooter';

export default function InviteCreatePage() {
  const [personA, setPersonA] = useState<PersonFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    city: '',
  });
  const [relType, setRelType] = useState<RelationshipType>('romantic');
  const [dateError, setDateError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personA.birthDate) {
      setDateError('Please enter your birth date to cross stars');
      return;
    }
    setDateError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personA: {
            name: personA.name.trim() || 'You',
            birthDate: personA.birthDate,
            birthTime: personA.birthTime || undefined,
            city: personA.city || undefined,
            latitude: personA.latitude,
            longitude: personA.longitude,
          },
          relationshipType: relType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.inviteUrl) {
        setInviteUrl(data.inviteUrl);
      } else {
        // Fallback for client-side generation
        const { createInvite } = await import('@/lib/vault/invite-store');
        const inv = createInvite({
          personA: {
            name: personA.name.trim() || 'You',
            birthDate: personA.birthDate,
            birthTime: personA.birthTime || undefined,
            city: personA.city || undefined,
            latitude: personA.latitude,
            longitude: personA.longitude,
          },
          relationshipType: relType,
        });
        const url = `${window.location.origin}/invite/${inv.token}`;
        setInviteUrl(url);
      }
    } catch {
      setDateError('Failed to generate invite link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Cross Our Stars — Astrological Synastry',
          text: `Enter your birth date to privately cross our birth charts and unlock our mutual synastry.`,
          url: inviteUrl,
        });
      } catch {
        // Ignore share cancellation
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-sans text-base tracking-[-0.03em] font-semibold text-[#141414] hover:opacity-75 transition-opacity"
          >
            <svg width="24" height="16" viewBox="0 0 36 24" fill="none" aria-hidden="true">
              <rect x="16.5" y="1" width="3" height="2" rx="1" fill="#141414" />
              <rect x="12" y="5" width="3.5" height="2" rx="1" fill="#141414" />
              <rect x="17" y="5" width="7" height="2" rx="1" fill="#141414" />
              <rect x="9" y="9" width="8" height="2" rx="1" fill="#141414" />
              <rect x="18.5" y="9" width="8.5" height="2" rx="1" fill="#141414" />
              <rect x="6" y="13" width="13.5" height="2" rx="1" fill="#141414" />
              <rect x="21" y="13" width="9" height="2" rx="1" fill="#141414" />
              <rect x="3" y="17" width="19" height="2" rx="1" fill="#141414" />
              <rect x="23.5" y="17" width="9.5" height="2" rx="1" fill="#141414" />
              <rect x="0" y="21" width="25" height="2" rx="1" fill="#141414" />
            </svg>
            <span>StarMatch</span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#575657]">
            2-Way Consent Link
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex-1">
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="text-center space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#141414] font-semibold bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-1">
              ✦ Mutual Privacy Flow
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#141414]">
              Cross Our Stars
            </h1>
            <p className="text-xs sm:text-sm text-[#575657] font-sans max-w-md mx-auto leading-relaxed">
              Don&apos;t know their exact birth time or want explicit mutual consent? Enter your data, send them the link, and both of you reveal your synastry simultaneously.
            </p>
          </div>

          {!inviteUrl ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Relationship Type Selector */}
              <div className="space-y-2">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-[#575657]">
                  Relationship Dynamic
                </span>
                <RelationshipTypeSelector value={relType} onChange={setRelType} />
              </div>

              {/* Person A Birth Input */}
              <PersonInputCard
                label="Your Birth Data"
                defaultPlaceholderName="You"
                data={personA}
                onChange={setPersonA}
                error={dateError}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                className="py-4 text-sm font-bold uppercase tracking-wider min-h-[48px]"
              >
                {isSubmitting ? 'Generating Invite...' : 'Create Invite Link →'}
              </Button>
            </form>
          ) : (
            <div className="p-6 sm:p-8 bg-white border border-[#141414] space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2 border-b border-[#D6D6D6] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#141414] font-bold">
                  ✓ Link Ready to Send
                </span>
                <h2 className="text-xl font-serif font-normal tracking-tight text-[#141414]">
                  Your Invite Is Live
                </h2>
                <p className="text-xs text-[#575657]">
                  Send this unguessable link to your partner or crush. It expires in 7 days.
                </p>
              </div>

              {/* URL Box */}
              <div className="bg-[#FBFBFB] border border-[#D6D6D6] p-3.5 flex items-center justify-between gap-2 overflow-hidden">
                <span className="font-mono text-xs text-[#141414] truncate select-all">
                  {inviteUrl}
                </span>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCopy}
                  className="w-full font-mono text-xs uppercase tracking-wider min-h-[44px]"
                >
                  {copied ? '✓ Link Copied' : 'Copy Invite Link'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleShare}
                  className="w-full font-mono text-xs uppercase tracking-wider min-h-[44px]"
                >
                  Share via Messages
                </Button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setInviteUrl('')}
                  className="text-xs font-mono text-[#575657] hover:text-[#141414] underline underline-offset-4"
                >
                  Create another invite
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
