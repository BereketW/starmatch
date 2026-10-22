import { NextRequest, NextResponse } from 'next/server';
import { getInvite, completeInvite } from '@/lib/vault/invite-store';
import { BirthData } from '@/lib/astro/types';

interface RouteProps {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, props: RouteProps) {
  const { token } = await props.params;
  const invite = getInvite(token);

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  // Safe public preview for Person B (do not expose full birth timestamps if unconsented)
  const personAName = invite.personA.name || invite.personA.zodiacSign || 'Someone';
  const personASign = invite.personA.zodiacSign || 'Unknown';

  return NextResponse.json({
    token: invite.token,
    status: invite.status,
    relationshipType: invite.relationshipType,
    personAName,
    personASign,
    expiresAt: invite.expiresAt,
    matchId: invite.matchId || null,
  });
}

export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const { token } = await props.params;
    const body = await req.json();
    const personB: BirthData = body.personB;

    if (!personB || (!personB.birthDate && !personB.zodiacSign)) {
      return NextResponse.json(
        { error: 'Valid birthDate or zodiacSign is required for Person B' },
        { status: 400 }
      );
    }

    const { invite, matchId } = completeInvite(token, personB);

    return NextResponse.json({
      success: true,
      token: invite.token,
      matchId,
      redirectUrl: `/match/${matchId}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete invite';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
