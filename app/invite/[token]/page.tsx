import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getInvite } from '@/lib/vault/invite-store';
import { EditorialFooter } from '@/components/home/EditorialFooter';
import InviteAcceptClient from './InviteAcceptClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { token } = await props.params;
  const invite = getInvite(token);

  if (!invite) {
    return {
      title: 'Invite Not Found — StarMatch',
      description: 'The requested StarMatch invite link is invalid or expired.',
    };
  }

  const senderName = invite.personA.name || 'Someone';

  return {
    title: `${senderName} wants to Cross Stars — StarMatch`,
    description: `Private 2-way astrological compatibility check with ${senderName}. 0.1° ephemeris precision.`,
  };
}

async function InviteContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <InviteAcceptClient token={token} />;
}

export default function InviteTokenPage(props: PageProps) {
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
            2-Way Mutual Consent
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex-1">
        <Suspense
          fallback={
            <div className="p-8 text-center text-[#575657] font-mono text-xs animate-pulse">
              Loading cosmic invite...
            </div>
          }
        >
          <InviteContent params={props.params} />
        </Suspense>
      </main>

      <EditorialFooter />
    </div>
  );
}
