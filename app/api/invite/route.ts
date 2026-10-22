import { NextRequest, NextResponse } from 'next/server';
import { createInvite, globalInviteStore } from '@/lib/vault/invite-store';
import { BirthData, RelationshipType } from '@/lib/astro/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const personA: BirthData = body.personA;
    const relationshipType: RelationshipType = body.relationshipType || 'romantic';
    const expiresInDays: number | undefined = body.expiresInDays;

    if (!personA || (!personA.birthDate && !personA.zodiacSign)) {
      return NextResponse.json(
        { error: 'Valid birthDate or zodiacSign is required for Person A' },
        { status: 400 }
      );
    }

    const invite = createInvite({
      personA,
      relationshipType,
      expiresInDays,
    });

    const origin = req.nextUrl.origin || 'https://starmatch.app';
    const inviteUrl = `${origin}/invite/${invite.token}`;

    return NextResponse.json({
      success: true,
      token: invite.token,
      inviteUrl,
      expiresAt: invite.expiresAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create invite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const invites = globalInviteStore.listInvites().map((inv) => ({
    token: inv.token,
    status: inv.status,
    relationshipType: inv.relationshipType,
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
  }));
  return NextResponse.json({ invites });
}
