export default function DiffsSlide() {
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
        className="absolute -bottom-[20vh] -right-[6vw] w-[32vw] h-[32vw] rounded-full bg-primary/20 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        VERIFIABLE DIFFS
      </div>

      <div className="absolute inset-0 z-10 grid grid-cols-2 items-center gap-[4vw] px-[8vw]">
        <div>
          <div className="text-[1.1vw] font-semibold tracking-[0.25em] text-accent mb-[2vh]">
            SEE EXACTLY WHAT MOVED
          </div>
          <h2 className="text-[3.4vw] font-extrabold tracking-tight leading-[1.05] [text-wrap:balance]">
            Diffs you can actually verify
          </h2>

          <div className="mt-[4vh] flex flex-col gap-[2.4vh]">
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-primary shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug max-w-[34vw]">
                Side-by-side V1 vs V2 comparison for both summary and transcript
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-primary shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug max-w-[34vw]">
                Toggle line-level and word-level diffs — a speaker fix reads as +/-
                a few words, not a whole rewritten line
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-primary shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug max-w-[34vw]">
                A "What changed" panel shows the model's own justification for
                every edit
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-accent shrink-0" />
              <p className="text-[1.6vw] text-white font-semibold leading-snug max-w-[34vw]">
                Approve only once you've seen exactly what moved
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1vw] border border-white/10 bg-[#0a0d16] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-2 border-b border-white/10 bg-panel text-[1vw] font-semibold">
            <div className="px-[1.4vw] py-[1.4vh] text-muted border-r border-white/10">
              V1
            </div>
            <div className="px-[1.4vw] py-[1.4vh] text-white">V2</div>
          </div>
          <div className="font-mono text-[1.05vw] leading-[1.8]">
            <div className="grid grid-cols-2">
              <div className="px-[1.2vw] py-[1.2vh] bg-[#2a1216] text-white/70 border-r border-white/10">
                <span className="text-[#ff8a8a]">- </span>Sarah owns the rollout.
              </div>
              <div className="px-[1.2vw] py-[1.2vh] bg-[#0f2418] text-white/85">
                <span className="text-[#84e3a8]">+ </span>D. Park owns the rollout.
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="px-[1.2vw] py-[1.2vh] text-white/55 border-r border-white/10">
                Budget approved Q2.
              </div>
              <div className="px-[1.2vw] py-[1.2vh] text-white/55">
                Budget approved Q2.
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="px-[1.2vw] py-[1.2vh] text-white/55 border-r border-white/10">
                Follow-up next week.
              </div>
              <div className="px-[1.2vw] py-[1.2vh] text-white/55">
                Follow-up next week.
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 bg-panel px-[1.4vw] py-[1.6vh]">
            <div className="text-[0.85vw] font-semibold tracking-[0.2em] text-accent">
              WHAT CHANGED
            </div>
            <p className="mt-[0.6vh] text-[1vw] text-white/65">
              Corrected speaker attribution; no other edits.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        06 / 09
      </div>
    </div>
  );
}
