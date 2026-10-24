import React from 'react';

export interface TransitItem {
  title: string;
  description: string;
}

export interface PowerPressureProps {
  transits: {
    power?: TransitItem[];
    pressure?: TransitItem[];
  };
  className?: string;
}

export const PowerPressure: React.FC<PowerPressureProps> = ({
  transits,
  className = '',
}) => {
  const powerItems = transits?.power || [];
  const pressureItems = transits?.pressure || [];

  const totalCount = powerItems.length + pressureItems.length;
  const powerPercent =
    totalCount > 0 ? Math.round((powerItems.length / totalCount) * 100) : 50;
  const pressurePercent = 100 - powerPercent;

  // Fallback items if the cosmic sky is quiet
  const displayPower =
    powerItems.length > 0
      ? powerItems
      : [
          {
            title: 'Solar Harmonic Baseline',
            description:
              'Steady planetary rhythm in the sky today allows natural, unforced conversational flow.',
          },
        ];

  const displayPressure =
    pressureItems.length > 0
      ? pressureItems
      : [
          {
            title: 'Subtle Atmospheric Friction',
            description:
              'Minor background transits encourage mutual patience and conscious clarity around expectations.',
          },
        ];

  return (
    <div
      className={`p-6 sm:p-8 bg-white border border-[#D6D6D6] rounded-none text-[#141414] space-y-6 ${className}`.trim()}
    >
      <div className="border-b border-[#D6D6D6] pb-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657]">
          Transit Weather
        </span>
        <h3 className="text-xl font-serif font-normal tracking-tight text-[#141414] mt-0.5">
          Power vs. Pressure Dynamics
        </h3>
      </div>

      {/* Balance Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.06em]">
          <span className="text-[#141414] font-semibold flex items-center gap-1.5">
            ● POWER ({powerItems.length})
          </span>
          <span className="text-[#575657] text-[11px]">Real-time Planetary Forces</span>
          <span className="text-[#141414] font-semibold flex items-center gap-1.5">
            PRESSURE ({pressureItems.length}) ▲
          </span>
        </div>

        {/* Dual Bar */}
        <div className="h-3 w-full bg-[#F4F4F2] border border-[#575657] overflow-hidden flex">
          <div
            className="h-full bg-[rgba(144,202,243,0.75)] border-r border-[#575657] transition-all duration-700"
            style={{ width: `${powerPercent}%` }}
            title={`Power: ${powerPercent}%`}
          />
          <div
            className="h-full bg-[rgba(243,144,144,0.75)] transition-all duration-700"
            style={{ width: `${pressurePercent}%` }}
            title={`Pressure: ${pressurePercent}%`}
          />
        </div>
      </div>

      {/* Active Transit Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Power Section */}
        <div className="space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#141414] block">
            ✦ Power (Harmonic Velocity)
          </span>
          <div className="space-y-2.5">
            {displayPower.map((item, i) => (
              <div
                key={i}
                className="p-3.5 bg-[rgba(144,202,243,0.2)] border border-[#575657]/50 space-y-1"
              >
                <h4 className="text-xs font-mono font-bold uppercase tracking-[0.06em] text-[#141414]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#575657] leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pressure Section */}
        <div className="space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#141414] block">
            ⚠ Pressure (Growth Edges)
          </span>
          <div className="space-y-2.5">
            {displayPressure.map((item, i) => (
              <div
                key={i}
                className="p-3.5 bg-[rgba(243,144,144,0.2)] border border-[#575657]/50 space-y-1"
              >
                <h4 className="text-xs font-mono font-bold uppercase tracking-[0.06em] text-[#141414]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#575657] leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
