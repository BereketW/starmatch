'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PersonFormData, PersonInputCard } from '@/components/home/PersonInputCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { completeInvite, getInvite } from '@/lib/vault/invite-store';

interface InvitePreview {
  token: string;
  status: 'pending' | 'completed' | 'expired';
  relationshipType: string;
  personAName: string;
  personASign?: string;
  expiresAt: number;
  matchId?: string | null;
}

export default function InviteAcceptClient({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string>('');

  const [personB, setPersonB] = useState<PersonFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    city: '',
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invite/${token}`);
        if (res.ok) {
          const data = await res.json();
          setInvite(data);
        } else {
          // Check local store directly
          const local = getInvite(token);
          if (local) {
            setInvite({
              token: local.token,
              status: local.status,
              relationshipType: local.relationshipType,
              personAName: local.personA.name || local.personA.zodiacSign || 'Someone',
              personASign: local.personA.zodiacSign,
              expiresAt: local.expiresAt,
              matchId: local.matchId,
            });
          } else {
            setError('This invite link is invalid or has expired.');
          }
        }
      } catch {
        const local = getInvite(token);
        if (local) {
          setInvite({
            token: local.token,
            status: local.status,
            relationshipType: local.relationshipType,
            personAName: local.personA.name || local.personA.zodiacSign || 'Someone',
            personASign: local.personA.zodiacSign,
            expiresAt: local.expiresAt,
            matchId: local.matchId,
          });
        } else {
          setError('Failed to load invite link.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personB.birthDate) {
      setDateError('Please enter your birth date');
      return;
    }
    if (!consentGiven) {
      setDateError('Please confirm consent to reveal your mutual compatibility');
      return;
    }

    setDateError('');
    setIsSubmitting(true);

    const bPayload = {
      name: personB.name.trim() || 'You',
      birthDate: personB.birthDate,
      birthTime: personB.birthTime || undefined,
      city: personB.city || undefined,
      latitude: personB.latitude,
      longitude: personB.longitude,
    };

    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personB: bPayload }),
      });

      const data = await res.json();
      if (res.ok && data.matchId) {
        router.push(data.redirectUrl || `/match/${data.matchId}`);
      } else {
        // Fallback to client-side completeInvite
        const completed = completeInvite(token, bPayload);
        router.push(`/match/${completed.matchId}`);
      }
    } catch {
      try {
        const completed = completeInvite(token, bPayload);
        router.push(`/match/${completed.matchId}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to cross stars';
        setDateError(msg);
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-mono text-xs text-[#575657]">Verifying cosmic invitation...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="p-6 sm:p-8 bg-white border border-[#D6D6D6] text-center space-y-4">
        <div className="text-[#141414] text-3xl font-mono">!</div>
        <h2 className="text-lg font-serif font-normal text-[#141414]">Invite Expired or Invalid</h2>
        <p className="text-xs text-[#575657] max-w-sm mx-auto leading-relaxed">
          {error || 'This invite link could not be found or has exceeded its 7-day expiration.'}
        </p>
        <div className="pt-2">
          <Link href="/invite">
            <Button variant="primary" size="md">
              Create a New Invite →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (invite.status === 'completed' && invite.matchId) {
    return (
      <div className="p-6 sm:p-8 bg-white border border-[#141414] text-center space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[#141414] font-bold">
          ✦ Stars Already Crossed
        </span>
        <h2 className="text-2xl font-serif font-normal text-[#141414]">
          Compatibility Unlocked
        </h2>
        <p className="text-xs text-[#575657] max-w-sm mx-auto leading-relaxed">
          This invite has already been accepted. Both charts have been calculated.
        </p>
        <div className="pt-2">
          <Link href={`/match/${invite.matchId}`}>
            <Button variant="primary" size="lg" className="w-full">
              View Mutual Synastry Report →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sender Hero Box */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2">
          <Badge variant="outline" size="sm">
            {invite.relationshipType} synastry
          </Badge>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#141414] bg-[#FBFBFB] border border-[#D6D6D6] px-2 py-0.5">
            Consent Protected
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#141414]">
          {invite.personAName} <span className="text-[#575657] italic">invited you</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#575657] max-w-md mx-auto leading-relaxed">
          Enter your birth date below. Neither person sees raw data—your mutual astrological compatibility will unlock simultaneously.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PersonInputCard
          label="Your Birth Data"
          defaultPlaceholderName="You"
          data={personB}
          onChange={setPersonB}
          error={dateError}
        />

        {/* Mutual Consent Checkbox */}
        <div className="p-4 bg-[#FBFBFB] border border-[#D6D6D6] flex items-start gap-3">
          <input
            id="consent-check"
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 h-4 w-4 border-[#141414] bg-white text-[#141414] focus:ring-1 focus:ring-[#141414] cursor-pointer"
          />
          <label htmlFor="consent-check" className="text-xs text-[#575657] leading-snug cursor-pointer select-none">
            I consent to cross my birth chart with <span className="text-[#141414] font-semibold">{invite.personAName}</span> to reveal our mutual compatibility scores and transit dynamics.
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting || !consentGiven}
          className="py-4 text-sm font-bold uppercase tracking-wider min-h-[48px]"
        >
          {isSubmitting ? 'Crossing Stars...' : 'Cross Our Stars & Reveal Compatibility →'}
        </Button>
      </form>
    </div>
  );
}
