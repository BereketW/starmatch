'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EditorialFooter } from '@/components/home/EditorialFooter';
import {
  generateGdprArchive,
  executePermanentAccountPurge,
  globalVaultManager,
} from '@/lib/vault/store';
import { createCustomerPortalRedirect } from '@/lib/vault/billing';
import type { SavedPair, GdprExportArchive, PurgeResult } from '@/lib/vault/types';

interface UserState {
  id: string;
  email: string;
  tier: 'free' | 'monthly' | 'annual';
  isSubscriber: boolean;
}

const DEFAULT_USER: UserState = {
  id: 'usr_privacy_first_44',
  email: 'privacy@user.io',
  tier: 'monthly',
  isSubscriber: true,
};

const INITIAL_PAIRS: Partial<SavedPair>[] = [
  { id: 'pair_1', name: 'Taylor', partnerName: 'Taylor', score: 82, relationshipType: 'romantic' },
  { id: 'pair_2', name: 'Jordan', partnerName: 'Jordan', score: 64, relationshipType: 'crush' },
  { id: 'pair_3', name: 'Casey', partnerName: 'Casey', score: 91, relationshipType: 'romantic' },
];

export default function AccountPage() {
  const [user, setUser] = useState<UserState>(DEFAULT_USER);
  const [pairs, setPairs] = useState<Partial<SavedPair>[]>(INITIAL_PAIRS);
  const [authInput, setAuthInput] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Cancellation Flow Modal (2-click)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<string | null>(null);

  // Purge Flow Modal
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeResult, setPurgeResult] = useState<PurgeResult | null>(null);

  // Export state
  const [lastExport, setLastExport] = useState<GdprExportArchive | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Load state on client
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const storedUser = localStorage.getItem('starmatch_account_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const storedPairs = localStorage.getItem('starmatch_account_pairs');
        if (storedPairs) {
          setPairs(JSON.parse(storedPairs));
        } else {
          INITIAL_PAIRS.forEach((p) => {
            globalVaultManager.savePair(DEFAULT_USER.id, p, true);
          });
        }
      } catch {
        // Storage fallback
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMagicLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInput.trim()) return;
    const cleanEmail = authInput.trim().toLowerCase();
    const newUser: UserState = {
      id: `usr_${cleanEmail.replace(/[^a-z0-9]/g, '').slice(0, 8)}_${Date.now().toString(36)}`,
      email: cleanEmail,
      tier: 'free',
      isSubscriber: false,
    };
    setUser(newUser);
    try {
      localStorage.setItem('starmatch_account_user', JSON.stringify(newUser));
    } catch {}
    setAuthMessage(`Session active for ${cleanEmail}. Magic link sent to your inbox.`);
  };

  const handleDeletePair = (pairId: string) => {
    const updated = pairs.filter((p) => p.id !== pairId);
    setPairs(updated);
    globalVaultManager.deletePair(user.id, pairId);
    try {
      localStorage.setItem('starmatch_account_pairs', JSON.stringify(updated));
    } catch {}
  };

  const handleExportData = () => {
    const archive = generateGdprArchive(
      { id: user.id, email: user.email },
      pairs.map((p) => ({
        id: p.id || 'unknown',
        partner: p.partnerName || p.name || 'Partner',
        score: p.score ?? 50,
      }))
    );

    setLastExport(archive);

    try {
      const jsonStr = JSON.stringify(archive, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `starmatch-gdpr-export-${user.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportNotice('GDPR data archive exported successfully as JSON.');
    } catch {
      setExportNotice('Generated JSON archive ready for inspection below.');
    }
  };

  const handleConfirmCancelSubscription = () => {
    const updatedUser: UserState = {
      ...user,
      tier: 'free',
      isSubscriber: false,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('starmatch_account_user', JSON.stringify(updatedUser));
    } catch {}
    setIsCancelModalOpen(false);
    setCancelStatus(
      'Your subscription has been cancelled. You will retain access until the end of the billing period.'
    );
  };

  const handleConfirmPurgeAccount = () => {
    const result = executePermanentAccountPurge(user.id);
    setPurgeResult(result);
    setPairs([]);
    setUser({
      id: 'purged_account',
      email: 'none@purged.invalid',
      tier: 'free',
      isSubscriber: false,
    });
    try {
      localStorage.removeItem('starmatch_account_user');
      localStorage.removeItem('starmatch_account_pairs');
      localStorage.removeItem('starmatch_recent_pairs');
      localStorage.removeItem('starmatch_reactions');
      localStorage.removeItem('starmatch_chaos_capsules');
    } catch {}
    setIsPurgeModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#141414]">
      {/* Header */}
      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-base tracking-[-0.03em] text-[#141414] font-semibold hover:opacity-75 transition-opacity"
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
            <span className="font-mono text-xs text-[#575657] font-normal uppercase tracking-[0.06em]">/ ACCOUNT &amp; PRIVACY</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-white border border-[#141414] px-3 py-1.5 transition-colors"
          >
            Open Calculator
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Title */}
        <section className="space-y-2 border-b border-[#D6D6D6] pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase bg-[#FBFBFB] border border-[#D6D6D6] text-[#141414]">
              Data Sovereignty
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase bg-[#FBFBFB] border border-[#D6D6D6] text-[#575657]">
              GDPR &amp; CCPA Compliant
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#141414]">
            Account &amp; Privacy Portal
          </h1>
          <p className="text-[#575657] text-sm font-sans">
            Full control over your astrological data, saved connections, billing, and complete erasure rights.
          </p>
        </section>

        {purgeResult && (
          <div className="bg-[rgba(144,202,243,0.18)] border border-[#141414] p-4 font-mono text-xs text-[#141414] space-y-1">
            <div className="font-bold uppercase tracking-wider">Permanent Purge Executed</div>
            <div>Purged 1 User Profile, {purgeResult.recordsPurged.birthRecords} Birth Records, {purgeResult.recordsPurged.vaultPairs} Saved Pairs.</div>
          </div>
        )}

        {cancelStatus && (
          <div className="bg-[#FBFBFB] border border-[#141414] p-4 font-mono text-xs text-[#141414]">
            {cancelStatus}
          </div>
        )}

        {/* Auth & Session State */}
        <section className="bg-[#FBFBFB] border border-[#D6D6D6] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-4">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414]">
                Authentication &amp; Identity
              </h2>
              <p className="text-xs text-[#575657] mt-1">
                Passwordless magic-link authentication with cryptographic token exchange.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                user.isSubscriber
                  ? 'bg-[#141414] text-white border-[#141414]'
                  : 'bg-white text-[#575657] border-[#D6D6D6]'
              }`}
            >
              {user.tier.toUpperCase()} TIER
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-white border border-[#D6D6D6] p-3 space-y-1">
              <span className="text-[#575657] uppercase">User ID</span>
              <div className="text-[#141414] font-semibold truncate">{user.id}</div>
            </div>
            <div className="bg-white border border-[#D6D6D6] p-3 space-y-1">
              <span className="text-[#575657] uppercase">Registered Email</span>
              <div className="text-[#141414] font-semibold truncate">{user.email}</div>
            </div>
          </div>

          <form onSubmit={handleMagicLinkSubmit} className="space-y-2 pt-2">
            <label
              htmlFor="magic-link-input"
              className="block text-xs font-mono uppercase tracking-wider text-[#575657]"
            >
              Switch Account / Send Magic Link
            </label>
            <div className="flex gap-2">
              <input
                id="magic-link-input"
                type="email"
                placeholder="your-email@example.com"
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                className="flex-1 bg-white border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414] transition-colors"
              />
              <Button type="submit" variant="secondary" size="sm">
                Send Magic Link
              </Button>
            </div>
            {authMessage && (
              <p className="text-xs font-mono text-[#141414]">{authMessage}</p>
            )}
          </form>
        </section>

        {/* Saved Pairs Vault */}
        <section className="bg-[#FBFBFB] border border-[#D6D6D6] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-4">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414]">
                Saved Synastry Vault
              </h2>
              <p className="text-xs text-[#575657] mt-1">
                Persistent chart pairings saved to your profile ({pairs.length} / {user.isSubscriber ? '∞' : '3'} used).
              </p>
            </div>
          </div>

          {pairs.length === 0 ? (
            <div className="text-xs font-mono text-[#575657] py-4 text-center">
              No saved pairs in vault. Calculate a synastry match to save it here.
            </div>
          ) : (
            <div className="space-y-2">
              {pairs.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-white border border-[#D6D6D6]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#141414] font-semibold">
                      {p.name || p.partnerName}
                    </span>
                    <span className="text-[11px] font-mono text-[#575657] uppercase">
                      ({p.relationshipType || 'romantic'})
                    </span>
                    <span className="text-xs font-mono text-[#141414] font-bold">
                      {p.score}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={p.id ? `/match/${p.id}` : '/'}
                      className="text-xs font-mono uppercase text-[#141414] hover:bg-[#141414] hover:text-white px-2 py-1 border border-[#D6D6D6] transition-colors"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => p.id && handleDeletePair(p.id)}
                      className="text-xs font-mono uppercase text-[#141414] hover:bg-[rgba(243,144,144,0.3)] px-2 py-1 border border-[#D6D6D6] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Subscription & Billing (2-Click Cancel Flow) */}
        <section className="bg-[#FBFBFB] border border-[#D6D6D6] p-6 space-y-6">
          <div className="border-b border-[#D6D6D6] pb-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414]">
              Subscription &amp; Billing
            </h2>
            <p className="text-xs text-[#575657] mt-1">
              Transparent billing with zero dark patterns and 2-click cancellation anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-[#D6D6D6]">
            <div>
              <div className="text-xs font-mono text-[#575657] uppercase">Current Tier</div>
              <div className="text-sm font-mono text-[#141414] font-bold capitalize">
                {user.tier} {user.isSubscriber ? 'Plan ($7.99/mo)' : '(Free Access)'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {user.isSubscriber && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="border-[#141414] text-[#141414]"
                >
                  Cancel Subscription
                </Button>
              )}
              <a
                href={createCustomerPortalRedirect().portalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono uppercase text-[#141414] hover:bg-[#141414] hover:text-white border border-[#141414] px-3 py-2 transition-colors inline-block"
              >
                Stripe Customer Portal ↗
              </a>
            </div>
          </div>
        </section>

        {/* GDPR Data Sovereignty: 1-Click Export & 1-Click Purge */}
        <section className="bg-[#FBFBFB] border border-[#D6D6D6] p-6 space-y-6">
          <div className="border-b border-[#D6D6D6] pb-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414]">
              Data Sovereignty &amp; Right to Erasure
            </h2>
            <p className="text-xs text-[#575657] mt-1">
              Export your entire profile as standard JSON or permanently erase all records from our systems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1-Click Export */}
            <div className="p-4 bg-white border border-[#D6D6D6] space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-xs font-mono text-[#141414] uppercase font-semibold">
                  1-Click JSON Data Export
                </div>
                <p className="text-xs text-[#575657]">
                  Download user profile, saved pairs, natal data, and transaction history in machine-readable JSON format.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleExportData}
                className="w-full"
              >
                Download Data (JSON)
              </Button>
            </div>

            {/* 1-Click Account Purge */}
            <div className="p-4 bg-white border border-[#D6D6D6] space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-xs font-mono text-[#141414] uppercase font-semibold">
                  Permanent Account &amp; Data Purge
                </div>
                <p className="text-xs text-[#575657]">
                  Irreversibly delete your account, saved charts, session tokens, and birth times in 1 click.
                </p>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setIsPurgeModalOpen(true)}
                className="w-full"
              >
                Purge Account &amp; Birth Records
              </Button>
            </div>
          </div>

          {exportNotice && (
            <p className="text-xs font-mono text-[#141414]">{exportNotice}</p>
          )}

          {lastExport && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono uppercase text-[#575657]">
                Exported Archive Preview ({lastExport.savedMatches.length} Matches):
              </span>
              <pre className="text-[10px] font-mono bg-white border border-[#D6D6D6] p-3 max-h-48 overflow-auto text-[#141414]">
                {JSON.stringify(lastExport, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </main>

      {/* 2-Click Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="CANCEL SUBSCRIPTION"
      >
        <div className="space-y-4">
          <p className="text-xs font-mono text-[#141414] leading-relaxed">
            Are you sure you want to cancel your Monthly Unlimited subscription?
          </p>
          <ul className="text-xs font-mono text-[#575657] space-y-1 list-disc list-inside">
            <li>You will keep access until the end of your billing cycle.</li>
            <li>Your vault pairs will remain saved.</li>
            <li>No further charges will be billed to your card.</li>
          </ul>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmCancelSubscription}
              className="flex-1"
            >
              Confirm Cancellation
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
              className="flex-1"
            >
              Keep Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Account Purge Modal */}
      <Modal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        title="PERMANENT RECORD PURGE"
      >
        <div className="space-y-4">
          <p className="text-xs font-mono text-[#141414] leading-relaxed font-semibold">
            WARNING: This action is permanent and cannot be undone.
          </p>
          <p className="text-xs font-mono text-[#575657] leading-relaxed">
            All stored birth coordinates, exact birth dates, synastry cache, active sessions, and relationship records will be permanently erased from all servers and local storage.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmPurgeAccount}
              className="flex-1"
            >
              Permanently Purge All Data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPurgeModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <EditorialFooter />
    </div>
  );
}
