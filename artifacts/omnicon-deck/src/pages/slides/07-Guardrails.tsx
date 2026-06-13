export default function GuardrailsSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-display">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "4vw 4vw",
        }}
      />
      <div
        className="absolute -top-[18vh] -right-[6vw] w-[30vw] h-[30vw] rounded-full bg-accent/20 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        GUARDRAILS
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-[7vw]">
        <div className="flex items-end justify-between mb-[4vh]">
          <div>
            <div className="text-[1.1vw] font-semibold tracking-[0.25em] text-accent mb-[1.5vh]">
              ON EVERY RUN
            </div>
            <h2 className="text-[3.6vw] font-extrabold tracking-tight leading-[1.05]">
              Five guardrails on every regeneration
            </h2>
          </div>
          <div className="text-[1.1vw] text-muted text-right max-w-[20vw] leading-snug">
            Shipped as a runnable 8-case demo suite (G1–G5)
          </div>
        </div>

        <div className="flex flex-col gap-[1.8vh]">
          <div className="flex items-center gap-[1.6vw] rounded-[0.8vw] border border-white/10 bg-panel px-[1.8vw] py-[1.8vh]">
            <div className="text-[1.4vw] font-extrabold text-primary w-[3vw] shrink-0">
              G1
            </div>
            <div className="text-[1.6vw] font-bold w-[16vw] shrink-0">Scoped Diff</div>
            <p className="text-[1.5vw] text-white/65 leading-snug">
              Blocks wholesale rewrites; edits must touch only what feedback
              referenced
            </p>
          </div>
          <div className="flex items-center gap-[1.6vw] rounded-[0.8vw] border border-white/10 bg-panel px-[1.8vw] py-[1.8vh]">
            <div className="text-[1.4vw] font-extrabold text-primary w-[3vw] shrink-0">
              G2
            </div>
            <div className="text-[1.6vw] font-bold w-[16vw] shrink-0">Locatability</div>
            <p className="text-[1.5vw] text-white/65 leading-snug">
              Rejects fixes to entities or facts that don't exist in the source
            </p>
          </div>
          <div className="flex items-center gap-[1.6vw] rounded-[0.8vw] border border-white/10 bg-panel px-[1.8vw] py-[1.8vh]">
            <div className="text-[1.4vw] font-extrabold text-primary w-[3vw] shrink-0">
              G3
            </div>
            <div className="text-[1.6vw] font-bold w-[16vw] shrink-0">Grounding</div>
            <p className="text-[1.5vw] text-white/65 leading-snug">
              New claims must be supported by the transcript (no fabrication)
            </p>
          </div>
          <div className="flex items-center gap-[1.6vw] rounded-[0.8vw] border border-white/10 bg-panel px-[1.8vw] py-[1.8vh]">
            <div className="text-[1.4vw] font-extrabold text-accent w-[3vw] shrink-0">
              G4
            </div>
            <div className="text-[1.6vw] font-bold w-[16vw] shrink-0">Injection</div>
            <p className="text-[1.5vw] text-white/65 leading-snug">
              Ignores "ignore previous instructions" in transcripts (G4-A) and
              blocks meta-instructions in feedback (G4-B)
            </p>
          </div>
          <div className="flex items-center gap-[1.6vw] rounded-[0.8vw] border border-white/10 bg-panel px-[1.8vw] py-[1.8vh]">
            <div className="text-[1.4vw] font-extrabold text-accent w-[3vw] shrink-0">
              G5
            </div>
            <div className="text-[1.6vw] font-bold w-[16vw] shrink-0">
              Language Scope
            </div>
            <p className="text-[1.5vw] text-white/65 leading-snug">
              Blocks non-English input (English-only)
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        07 / 09
      </div>
    </div>
  );
}
