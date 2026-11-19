import React from 'react';

interface LocationSketchProps {
  locationId: string;
  locationName: string;
  unlocked: boolean;
}

/**
 * Hand-crafted Victorian ink-on-parchment architectural field sketches
 * for every Ashcroft Manor wing and London location.
 */
export const LocationSketch: React.FC<LocationSketchProps> = ({
  locationId,
  locationName,
  unlocked,
}) => {
  const renderArtwork = () => {
    switch (locationId) {
      case 'loc-study':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Fireplace & Mantel Clock */}
            <path d="M34 128 V58 H96 V128" strokeWidth="1.7" />
            <rect x="28" y="52" width="74" height="6" fill="#d9c6a3" strokeWidth="1.4" />
            <path d="M56 52 V34 Q65 26 74 34 V52" fill="#e6d7ba" strokeWidth="1.4" />
            <circle cx="65" cy="40" r="6" strokeWidth="1.2" />
            <path d="M65 40 V36 M65 40 L68 42" strokeWidth="1.1" />
            <path d="M44 128 V86 Q65 74 86 86 V128" fill="#cbb692" fillOpacity="0.45" strokeWidth="1.3" />
            <path d="M55 124 Q60 105 65 112 Q72 100 75 124" strokeWidth="1.1" />
            {/* Desk & Fallen Inkwell */}
            <rect x="135" y="92" width="96" height="8" fill="#d9c6a3" strokeWidth="1.5" />
            <path d="M142 100 V132 M224 100 V132 M152 100 V126 M214 100 V126" strokeWidth="1.5" />
            <rect x="166" y="84" width="24" height="8" strokeWidth="1.1" />
            <circle cx="206" cy="87" r="4.5" strokeWidth="1.2" />
            {/* Casement Window */}
            <rect x="248" y="24" width="54" height="72" strokeWidth="1.6" />
            <path d="M275 24 V96 M248 60 H302" strokeWidth="1.1" />
            <path d="M254 32 L266 52 M282 36 L296 58 M256 68 L268 88" strokeWidth="0.7" strokeOpacity="0.55" />
            {/* Threshold Brass Bolt Annotation */}
            <path d="M18 134 H322" strokeWidth="1.2" strokeDasharray="4 3" />
            <text x="145" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              INSIDE BRASS BOLT · 11:41 CLOCK
            </text>
          </g>
        );

      case 'loc-library':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Twin Mahogany Bookcases */}
            <rect x="30" y="24" width="84" height="106" fill="#d8c5a2" fillOpacity="0.35" strokeWidth="1.6" />
            <path d="M30 48 H114 M30 74 H114 M30 100 H114" strokeWidth="1.2" />
            <path d="M40 28 V48 M46 30 V48 M54 27 V48 M78 52 V74 M85 54 V74 M94 50 V74 M42 78 V100 M50 76 V100" strokeWidth="1.2" />
            {/* Concealed Wainscot Alcove */}
            <rect x="132" y="34" width="68" height="96" strokeWidth="1.5" />
            <rect x="142" y="44" width="48" height="36" strokeWidth="1.1" strokeDasharray="3 2" />
            <rect x="142" y="88" width="48" height="32" strokeWidth="1.1" />
            <path d="M166 80 V88" strokeWidth="1.1" />
            {/* Umbrella Stand & Corridor */}
            <path d="M236 92 H260 L256 130 H240 Z" fill="#d8c5a2" strokeWidth="1.4" />
            <path d="M244 92 L238 56 Q236 48 244 50 M252 92 L262 58" strokeWidth="1.3" />
            <path d="M276 28 V130 M276 28 L314 18 V140 L276 130" strokeWidth="1.2" strokeOpacity="0.7" />
            <text x="128" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              45 YDS TO STUDY · SECRET PANEL
            </text>
          </g>
        );

      case 'loc-conservatory':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Arched Glasshouse Mullions */}
            <path d="M36 128 V58 Q170 10 304 58 V128" strokeWidth="1.7" />
            <path d="M84 128 V38 M132 128 V26 M170 128 V24 M208 128 V26 M256 128 V38" strokeWidth="1.1" />
            <path d="M36 74 H304 M36 100 H304" strokeWidth="1" />
            {/* Potted Ferns & Parlor Settee */}
            <path d="M62 128 L56 106 H78 L72 128 Z" fill="#cbb692" strokeWidth="1.3" />
            <path d="M67 106 Q50 86 44 92 M67 106 Q66 80 68 74 M67 106 Q84 86 90 94" strokeWidth="1.2" />
            <path d="M132 126 V104 Q170 96 208 104 V126 M126 116 H214" fill="#d9c6a3" fillOpacity="0.4" strokeWidth="1.5" />
            {/* Gas Sconce */}
            <path d="M268 78 H282 L279 62 Q275 52 271 62 Z" strokeWidth="1.2" />
            <text x="116" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              35 YDS TO STUDY · 11:26 FLICKER
            </text>
          </g>
        );

      case 'loc-grounds':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Wrought Iron Manor Gates & Pillars */}
            <rect x="46" y="42" width="24" height="88" fill="#d8c5a2" strokeWidth="1.6" />
            <rect x="206" y="42" width="24" height="88" fill="#d8c5a2" strokeWidth="1.6" />
            <path d="M42 42 H74 M202 42 H234" strokeWidth="1.8" />
            <circle cx="58" cy="34" r="6" strokeWidth="1.4" />
            <circle cx="218" cy="34" r="6" strokeWidth="1.4" />
            <path d="M70 58 Q138 42 206 58 M70 122 H206" strokeWidth="1.5" />
            <path d="M88 54 V122 M106 51 V122 M124 49 V122 M152 49 V122 M170 51 V122 M188 54 V122" strokeWidth="1.1" />
            {/* Gatehouse & Carriage Lantern */}
            <path d="M242 130 V72 L276 52 L310 72 V130 Z" fill="#d8c5a2" fillOpacity="0.45" strokeWidth="1.5" />
            <rect x="264" y="88" width="24" height="42" strokeWidth="1.2" />
            <path d="M22 130 H318" strokeWidth="1.4" />
            <text x="98" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              BELGRAVIA EAST GATE & GATEHOUSE
            </text>
          </g>
        );

      case 'loc-scotland-yard':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Turreted Whitehall Facade */}
            <path d="M48 128 V52 L66 26 L84 52 V128" fill="#d8c5a2" fillOpacity="0.45" strokeWidth="1.6" />
            <rect x="84" y="48" width="144" height="80" fill="#e5d6b8" fillOpacity="0.45" strokeWidth="1.6" />
            <path d="M228 128 V52 L246 26 L264 52 V128" fill="#d8c5a2" fillOpacity="0.45" strokeWidth="1.6" />
            <path d="M136 128 V90 Q156 76 176 90 V128" strokeWidth="1.5" />
            <rect x="100" y="64" width="18" height="26" strokeWidth="1.1" />
            <rect x="194" y="64" width="18" height="26" strokeWidth="1.1" />
            <rect x="146" y="58" width="20" height="18" strokeWidth="1.1" />
            {/* Gas Lamp */}
            <path d="M292 128 V76 M286 76 L292 64 L298 76 Z" strokeWidth="1.3" />
            <text x="108" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              NEW SCOTLAND YARD · WHITEHALL
            </text>
          </g>
        );

      case 'loc-baker-street':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Marylebone Bow Window & Analytical Bench */}
            <rect x="34" y="24" width="110" height="94" strokeWidth="1.6" />
            <path d="M70 24 V118 M108 24 V118 M34 68 H144" strokeWidth="1.1" />
            {/* Microscope & Chemical Retort */}
            <path d="M180 124 H284" strokeWidth="1.6" />
            <path d="M196 124 V92 L214 68 L222 74 L206 96" strokeWidth="1.5" />
            <path d="M186 124 H216" strokeWidth="2" />
            <circle cx="254" cy="108" r="14" strokeWidth="1.3" />
            <path d="M254 94 V76 L274 86 L274 124" strokeWidth="1.2" />
            <text x="98" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              MARYLEBONE CHAMBERS · TOXICOLOGY
            </text>
          </g>
        );

      case 'loc-doctor-office':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Georgian Porticoed Harley Street Entrance */}
            <rect x="64" y="34" width="212" height="96" fill="#d8c5a2" fillOpacity="0.35" strokeWidth="1.6" />
            <path d="M118 130 V58 L170 36 L222 58 V130" strokeWidth="1.5" />
            <path d="M130 58 V130 M210 58 V130" strokeWidth="2" />
            <rect x="150" y="76" width="40" height="54" strokeWidth="1.4" />
            <rect x="80" y="54" width="24" height="34" strokeWidth="1.1" />
            <rect x="236" y="54" width="24" height="34" strokeWidth="1.1" />
            <text x="104" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              HARLEY STREET · CLINICAL LEDGERS
            </text>
          </g>
        );

      case 'loc-boathouse':
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Riverside Stone Boathouse & Skiff */}
            <path d="M42 118 V54 L132 28 L222 54 V118" fill="#cbb692" fillOpacity="0.4" strokeWidth="1.6" />
            <path d="M88 118 V76 Q132 54 176 76 V118" fill="#5a6f75" fillOpacity="0.3" strokeWidth="1.5" />
            {/* Moored Skiff & Thames Ripples */}
            <path d="M198 112 Q248 126 298 110 L282 124 H212 Z" fill="#d8c5a2" strokeWidth="1.4" />
            <path d="M24 128 Q80 122 140 130 T 260 126 T 320 130" strokeWidth="1.1" strokeOpacity="0.7" />
            <text x="98" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              THAMES EMBANKMENT · SMUGGLING OUTLET
            </text>
          </g>
        );

      case 'loc-station':
      default:
        return (
          <g stroke="#2a1d14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Iron & Glass Train Shed Arch */}
            <path d="M36 128 V68 Q170 14 304 68 V128" strokeWidth="1.7" />
            <path d="M64 128 V54 Q170 26 276 54 V128" strokeWidth="1.1" />
            <circle cx="170" cy="48" r="10" fill="#efe4cf" strokeWidth="1.3" />
            <path d="M170 48 V42 M170 48 L175 50" strokeWidth="1.1" />
            {/* Steam Locomotive Silhouette */}
            <rect x="92" y="84" width="128" height="32" fill="#cbb692" fillOpacity="0.55" strokeWidth="1.5" />
            <rect x="200" y="64" width="14" height="20" strokeWidth="1.3" />
            <circle cx="114" cy="122" r="7" strokeWidth="1.4" />
            <circle cx="144" cy="122" r="7" strokeWidth="1.4" />
            <circle cx="182" cy="122" r="7" strokeWidth="1.4" />
            <path d="M206 58 Q220 42 240 44 Q256 32 278 38" strokeWidth="1.1" strokeDasharray="3 2" />
            <text x="100" y="146" fill="#5a4330" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="8">
              VICTORIA TERMINUS · 10:52 EXPRESS
            </text>
          </g>
        );
    }
  };

  return (
    <div className="relative rounded border border-[#8c7350] parchment-surface overflow-hidden shadow-inner">
      <svg
        viewBox="0 0 340 156"
        className={`w-full h-auto block ${!unlocked ? 'opacity-45 grayscale' : ''}`}
        role="img"
        aria-label={`Architectural ink sketch of ${locationName}`}
      >
        {/* Subtle drafting grid lines */}
        <rect width="340" height="156" fill="none" stroke="#8c7350" strokeOpacity="0.22" strokeWidth="1" />
        <path
          d="M0 39 H340 M0 78 H340 M0 117 H340 M85 0 V156 M170 0 V156 M255 0 V156"
          stroke="#8c7350"
          strokeOpacity="0.12"
          strokeWidth="0.7"
        />
        {/* Compass emblem corner */}
        <g transform="translate(22, 22)" stroke="#5a4330" strokeWidth="0.9" fill="none" opacity="0.7">
          <circle cx="0" cy="0" r="8" />
          <path d="M0 -11 V11 M-11 0 H11" />
        </g>

        {renderArtwork()}
      </svg>

      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#120f0d]/55">
          <span className="px-3 py-1 rounded bg-[#161210] border border-[#c99a4b]/45 font-mono-tabular text-[11px] uppercase tracking-wider text-[#c99a4b]">
            Sealed Lead · Deduce Link in Mind Palace
          </span>
        </div>
      )}
    </div>
  );
};
