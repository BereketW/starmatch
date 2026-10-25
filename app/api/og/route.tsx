import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { decodeMatchId } from '@/lib/synastry/match-id';
import { computeSynastry } from '@/lib/synastry/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId') || searchParams.get('id');

    let nameA = searchParams.get('nameA') || 'Person A';
    let nameB = searchParams.get('nameB') || 'Person B';
    let score = searchParams.get('score') || '84';
    let signs = searchParams.get('signs') || 'Natal × Natal';
    let relType = searchParams.get('relType') || 'Romantic';

    if (matchId) {
      const decoded = decodeMatchId(matchId);
      if (decoded) {
        nameA = decoded.personA.name || decoded.personA.zodiacSign || 'You';
        nameB = decoded.personB.name || decoded.personB.zodiacSign || 'Them';
        signs = `${decoded.personA.zodiacSign || 'Natal'} × ${decoded.personB.zodiacSign || 'Natal'}`;
        relType = decoded.relationshipType;
        try {
          const synastry = computeSynastry(decoded.personA, decoded.personB, {
            relationshipType: decoded.relationshipType,
          });
          score = String(synastry.overallScore);
        } catch {
          // fallback score remains
        }
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FBFBFB',
            padding: '56px 76px',
            fontFamily: 'serif',
            color: '#141414',
            border: '2px solid #141414',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #D6D6D6',
              paddingBottom: '22px',
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                fontFamily: 'monospace',
                color: '#141414',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              STARMATCH • 0.1° EPHEMERIS
            </div>
            <div
              style={{
                fontSize: 15,
                letterSpacing: 2,
                fontFamily: 'monospace',
                backgroundColor: '#F4F4F2',
                padding: '6px 16px',
                color: '#141414',
                border: '1px solid #141414',
                textTransform: 'uppercase',
              }}
            >
              {relType} Synastry
            </div>
          </div>

          {/* Hero Center */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                fontSize: 68,
                fontWeight: 400,
                letterSpacing: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                color: '#141414',
              }}
            >
              <span>{nameA}</span>
              <span style={{ color: '#575657', fontStyle: 'italic' }}>&amp;</span>
              <span>{nameB}</span>
            </div>

            <div
              style={{
                fontSize: 20,
                fontFamily: 'monospace',
                color: '#575657',
                letterSpacing: 3,
                textTransform: 'uppercase',
              }}
            >
              {signs}
            </div>

            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                padding: '16px 44px',
                border: '1.5px solid #141414',
              }}
            >
              <span
                style={{
                  fontSize: 88,
                  fontWeight: 400,
                  letterSpacing: '-3px',
                  color: '#141414',
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 400,
                  color: '#575657',
                }}
              >
                %
              </span>
              <span
                style={{
                  marginLeft: '16px',
                  fontSize: 16,
                  fontFamily: 'monospace',
                  letterSpacing: 3,
                  color: '#141414',
                  textTransform: 'uppercase',
                }}
              >
                Resonance
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #D6D6D6',
              paddingTop: '20px',
              color: '#575657',
              fontFamily: 'monospace',
              fontSize: 15,
              letterSpacing: 2,
            }}
          >
            <div>STARMATCH.APP</div>
            <div>ACCOUNT-FREE ASTROLOGICAL SYNASTRY</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
