import React, { useState } from 'react';
import { Eye, MessageSquare, ShieldAlert } from 'lucide-react';
import {
  CaseDefinition,
  DialogueTopic,
  InvestigationState,
  SuspectId,
} from '../types/game';

interface SuspectsViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  selectedSuspectId: SuspectId;
  onSelectSuspect: (id: SuspectId) => void;
  onAskTopic: (suspectId: SuspectId, topic: DialogueTopic) => void;
  onPressTopic: (suspectId: SuspectId, topic: DialogueTopic) => void;
  onChallengeTopic: (suspectId: SuspectId, topic: DialogueTopic) => void;
  onObservePerson: (suspectId: SuspectId, obsId: string) => void;
  onConfrontWithEvidence: (suspectId: SuspectId, evidenceIds: string[]) => string;
}

export const SuspectsView: React.FC<SuspectsViewProps> = ({
  caseDef,
  state,
  selectedSuspectId,
  onSelectSuspect,
  onAskTopic,
  onPressTopic,
  onChallengeTopic,
  onObservePerson,
  onConfrontWithEvidence,
}) => {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [showObservePanel, setShowObservePanel] = useState(false);
  const [showPresentPanel, setShowPresentPanel] = useState(false);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [confrontMessage, setConfrontMessage] = useState<string | null>(null);
  const [portraitErrors, setPortraitErrors] = useState<Record<string, boolean>>({});

  const suspect =
    caseDef.suspects.find((s) => s.id === selectedSuspectId) ?? caseDef.suspects[0];
  const sState = state.suspectState[suspect.id];

  const activeTopic =
    suspect.topics.find((t) => t.id === activeTopicId) ?? suspect.topics[0];

  const discoveredEvidence = caseDef.evidence.filter((e) =>
    state.discoveredEvidenceIds.includes(e.id)
  );

  const toggleEvidenceSelection = (id: string) => {
    setPresentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3)
    );
  };

  const handleConfrontSubmit = () => {
    const msg = onConfrontWithEvidence(suspect.id, presentIds);
    setConfrontMessage(msg);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Suspect Portrait Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {caseDef.suspects.map((s) => {
          const active = s.id === suspect.id;
          const st = state.suspectState[s.id];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onSelectSuspect(s.id);
                setActiveTopicId(null);
                setShowObservePanel(false);
                setShowPresentPanel(false);
                setConfrontMessage(null);
                setPresentIds([]);
              }}
              className={`text-left rounded-md overflow-hidden border transition-all cursor-pointer flex flex-col ${
                active
                  ? 'border-[#c99a4b] bg-[#241c17] shadow-lg'
                  : 'border-[#c99a4b]/20 bg-[#15110f] hover:border-[#c99a4b]/55'
              }`}
            >
              <div className="aspect-[3/4] w-full bg-[#0d0c0b] overflow-hidden relative">
                {!portraitErrors[s.id] ? (
                  <img
                    src={s.portraitUrl}
                    alt={`Portrait of ${s.name}`}
                    referrerPolicy="no-referrer"
                    onError={() => setPortraitErrors((p) => ({ ...p, [s.id]: true }))}
                    className="w-full h-full object-cover object-top scale-[1.07]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-2xl text-[#c99a4b]">
                    {s.name.slice(0, 2)}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2">
                  <div className="font-display text-xs text-[#f2eadc] truncate">{s.name}</div>
                  <div className="text-[11px] text-[#cbbba0] truncate">{s.occupation}</div>
                </div>
              </div>
              <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono-tabular text-[#a89b88]">
                <span>Susp: {st.suspicion}</span>
                <span>{st.alibiStatus}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Interrogation & Psychological Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Suspect Profile & Body Language */}
        <aside className="lg:col-span-4 leather-surface rounded-md p-5 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-24 rounded overflow-hidden border border-[#c99a4b]/35 shrink-0 bg-[#0d0c0b]">
              {!portraitErrors[suspect.id] && (
                <img
                  src={suspect.portraitUrl}
                  alt={suspect.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              )}
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="font-display text-lg text-[#f2eadc] leading-snug">{suspect.name}</h2>
              <p className="text-xs text-[#c99a4b]">
                Age {suspect.age} · {suspect.occupation}
              </p>
              <p className="text-xs text-[#a89b88]">{suspect.relationship}</p>
            </div>
          </div>

          {/* Body Language & Suspicion/Trust Readout */}
          <div className="p-3 rounded bg-[#120f0d] border border-[#c99a4b]/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider text-[#a89b88]">Body Language</span>
              <span className="text-[#c99a4b] font-medium">{sState.bodyLanguage}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-[#cbbba0] mb-1">
                  <span>Suspicion</span>
                  <span className="font-mono-tabular">{sState.suspicion}%</span>
                </div>
                <div className="h-1.5 bg-[#2a211b] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#9d3838] transition-all"
                    style={{ width: `${sState.suspicion}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[#cbbba0] mb-1">
                  <span>Trust</span>
                  <span className="font-mono-tabular">{sState.trust}%</span>
                </div>
                <div className="h-1.5 bg-[#2a211b] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#397a5c] transition-all"
                    style={{ width: `${sState.trust}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs text-[#a89b88] flex justify-between pt-1 border-t border-white/5">
              <span>Alibi Standing</span>
              <span className="font-mono-tabular text-[#f2eadc]">{sState.alibiStatus}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs leading-relaxed text-[#cbbba0]">
            <div>
              <span className="text-[#c99a4b] font-semibold">Personality: </span>
              {suspect.personality}
            </div>
            <div>
              <span className="text-[#c99a4b] font-semibold">Public Motive: </span>
              {suspect.publicMotive}
            </div>
            <div>
              <span className="text-[#c99a4b] font-semibold">Recorded Alibi: </span>
              {suspect.alibi}
            </div>
            <div>
              <span className="text-[#c99a4b] font-semibold">Psychological Note: </span>
              {suspect.psychologicalProfile}
            </div>
          </div>
        </aside>

        {/* Right: Dynamic Interrogation & Person Observation */}
        <div className="lg:col-span-8 leather-surface rounded-md p-5 space-y-5">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c99a4b]/20 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {suspect.topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setActiveTopicId(topic.id);
                    setShowObservePanel(false);
                    setShowPresentPanel(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                    activeTopic.id === topic.id && !showObservePanel && !showPresentPanel
                      ? 'bg-[#c99a4b] border-[#c99a4b] text-[#14100d] font-semibold'
                      : 'bg-[#14100d] border-[#c99a4b]/25 text-[#cbbba0] hover:text-[#f2eadc]'
                  }`}
                >
                  Subject: {topic.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowObservePanel((p) => !p);
                  setShowPresentPanel(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                  showObservePanel
                    ? 'bg-[#c99a4b] border-[#c99a4b] text-[#14100d] font-semibold'
                    : 'bg-[#201915] border-[#c99a4b]/35 text-[#f2eadc]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Observe Person</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPresentPanel((p) => !p);
                  setShowObservePanel(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                  showPresentPanel
                    ? 'bg-[#7a242c] border-[#c99a4b] text-[#f2eadc] font-semibold'
                    : 'bg-[#201915] border-[#c99a4b]/35 text-[#f2eadc]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Present Evidence / Confront</span>
              </button>
            </div>
          </div>

          {/* Observe Person Sub-panel */}
          {showObservePanel && (
            <div className="p-4 rounded bg-[#120f0d] border border-[#c99a4b]/35 space-y-3">
              <div className="text-xs uppercase tracking-wider text-[#c99a4b]">
                Physical Inspection — {suspect.name}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suspect.personObservations.map((pobs) => {
                  const observed = sState.observedPersonIds.includes(pobs.id);
                  return (
                    <div
                      key={pobs.id}
                      className="p-3 rounded bg-[#1a1512] border border-[#c99a4b]/20 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#f2eadc]">
                          {observed ? pobs.label : 'Examine Physical Detail'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onObservePerson(suspect.id, pobs.id)}
                          className="px-2.5 py-1 text-xs bg-[#c99a4b] text-[#14100d] font-semibold rounded cursor-pointer"
                        >
                          {observed ? 'Noted' : 'Observe'}
                        </button>
                      </div>
                      {observed && (
                        <p className="text-xs text-[#cbbba0] leading-relaxed">{pobs.detail}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Present Evidence / Confront Sub-panel */}
          {showPresentPanel && (
            <div className="p-4 rounded bg-[#120f0d] border border-[#7a242c] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-[#e39b86]">
                  Select 1–3 Discovered Exhibits to Confront Contradiction
                </span>
                <button
                  type="button"
                  onClick={handleConfrontSubmit}
                  className="px-4 py-1.5 text-xs bg-[#7a242c] hover:bg-[#932c36] text-[#f2eadc] font-display uppercase tracking-wider rounded cursor-pointer"
                >
                  Confront Suspect
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {discoveredEvidence.map((ev) => {
                  const picked = presentIds.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => toggleEvidenceSelection(ev.id)}
                      className={`text-left px-3 py-2 rounded border text-xs transition-colors cursor-pointer ${
                        picked
                          ? 'bg-[#c99a4b]/20 border-[#c99a4b] text-[#f2eadc]'
                          : 'bg-[#1a1512] border-white/10 text-[#cbbba0] hover:border-[#c99a4b]/40'
                      }`}
                    >
                      <div className="font-semibold truncate">{ev.name}</div>
                      <div className="text-[11px] text-[#a89b88]">{ev.category}</div>
                    </button>
                  );
                })}
              </div>
              {confrontMessage && (
                <p className="text-xs text-[#f2eadc] bg-[#1d1714] p-3 rounded border border-[#c99a4b]/25 leading-relaxed">
                  {confrontMessage}
                </p>
              )}
            </div>
          )}

          {/* Interrogation Choices for Active Subject */}
          <div className="p-4 rounded bg-[#14100d] border border-[#c99a4b]/20 space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#a89b88]">
              Interrogation Options · {activeTopic.label}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAskTopic(suspect.id, activeTopic)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/40 text-[#f2eadc] rounded cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#c99a4b]" />
                <span>Ask Statement</span>
              </button>

              <button
                type="button"
                onClick={() => onPressTopic(suspect.id, activeTopic)}
                disabled={!sState.askedTopicIds.includes(activeTopic.id)}
                className="px-3.5 py-2 text-xs bg-[#2b2018] hover:bg-[#3a2b20] disabled:opacity-40 border border-[#d9822b]/45 text-[#f2eadc] rounded cursor-pointer"
              >
                Press Detail
              </button>

              {activeTopic.challengeStatement && (
                <button
                  type="button"
                  onClick={() => onChallengeTopic(suspect.id, activeTopic)}
                  disabled={!sState.pressedTopicIds.includes(activeTopic.id)}
                  className="px-3.5 py-2 text-xs bg-[#4a1c20] hover:bg-[#622329] disabled:opacity-40 border border-[#c99a4b]/45 text-[#f2eadc] rounded cursor-pointer"
                >
                  Challenge Claim
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const idx = suspect.topics.findIndex((t) => t.id === activeTopic.id);
                  const next = suspect.topics[(idx + 1) % suspect.topics.length];
                  setActiveTopicId(next.id);
                }}
                className="px-3.5 py-2 text-xs bg-transparent hover:bg-white/5 border border-white/15 text-[#cbbba0] rounded cursor-pointer"
              >
                Change Subject
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowObservePanel(false);
                  setShowPresentPanel(false);
                  setConfrontMessage(null);
                }}
                className="px-3.5 py-2 text-xs bg-transparent hover:bg-white/5 border border-white/15 text-[#a89b88] rounded cursor-pointer"
              >
                End Interview
              </button>
            </div>
          </div>

          {/* Transcript Log */}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#a89b88]">
              Interview Transcript
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {sState.dialogueLog.map((entry, idx) => (
                <div
                  key={`${entry.speaker}-${idx}`}
                  className={`p-3 rounded text-sm leading-relaxed border ${
                    entry.speaker === 'Detective'
                      ? 'bg-[#1f1914] border-[#c99a4b]/30 text-[#e7dcc7]'
                      : 'bg-[#120f0d] border-white/10 text-[#f2eadc]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-display font-semibold text-[#c99a4b]">
                      {entry.speaker}
                    </span>
                    {entry.cue && (
                      <span className="font-mono-tabular text-[11px] text-[#a89b88]">
                        {entry.cue}
                      </span>
                    )}
                  </div>
                  <p>{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
