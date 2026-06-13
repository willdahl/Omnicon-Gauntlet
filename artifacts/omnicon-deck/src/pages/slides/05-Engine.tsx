export default function EngineSlide() {
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
        className="absolute -top-[20vh] -right-[8vw] w-[34vw] h-[34vw] rounded-full bg-accent/25 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        REGENERATION ENGINE
      </div>

      <div className="absolute inset-0 z-10 grid grid-cols-2 items-center gap-[4vw] px-[8vw]">
        <div>
          <div className="text-[1.1vw] font-semibold tracking-[0.25em] text-accent mb-[2vh]">
            INSIDE THE ENGINE
          </div>
          <h2 className="text-[3.4vw] font-extrabold tracking-tight leading-[1.05] [text-wrap:balance]">
            A live call, routed through OpenRouter
          </h2>

          <div className="mt-[4vh] flex flex-col gap-[2.4vh]">
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-accent shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug max-w-[34vw]">
                Bundles V1 transcript + V1 summary + reviewer feedback into one
                prompt
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-accent shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug max-w-[34vw]">
                Treats the transcript as inert data — only grounded, scoped
                corrections allowed
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-accent shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug max-w-[34vw]">
                Runs at temperature 0 for consistency, requesting reasoning traces
                where supported
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-accent shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug max-w-[34vw]">
                Returns V2 transcript, V2 summary, and a plain-English change
                explanation via delimited markers
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1vw] border border-white/10 bg-[#0a0d16] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-[0.7vw] border-b border-white/10 bg-panel px-[1.4vw] py-[1.4vh]">
            <span className="w-[0.8vw] h-[0.8vw] rounded-full bg-white/20" />
            <span className="w-[0.8vw] h-[0.8vw] rounded-full bg-white/20" />
            <span className="w-[0.8vw] h-[0.8vw] rounded-full bg-white/20" />
            <span className="ml-[1vw] text-[0.95vw] font-mono text-muted">
              regenerate.response
            </span>
          </div>
          <div className="px-[1.6vw] py-[2.2vh] font-mono text-[1.05vw] leading-[1.9]">
            <div className="text-accent">---SUMMARY_V2_START---</div>
            <div className="text-white/75">Action items reassigned to D. Park…</div>
            <div className="text-accent">---SUMMARY_V2_END---</div>
            <div className="mt-[1.4vh] text-primary">---TRANSCRIPT_V2_START---</div>
            <div className="text-white/75">[00:14] D. Park: I'll own the rollout.</div>
            <div className="text-primary">---TRANSCRIPT_V2_END---</div>
            <div className="mt-[1.4vh] text-white/40">---EXPLANATION_START---</div>
            <div className="text-white/55">
              Corrected speaker attribution per feedback.
            </div>
            <div className="text-white/40">---EXPLANATION_END---</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        05 / 09
      </div>
    </div>
  );
}
