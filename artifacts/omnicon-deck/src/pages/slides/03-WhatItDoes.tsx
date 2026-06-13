export default function WhatItDoesSlide() {
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
        className="absolute -bottom-[20vh] -left-[8vw] w-[32vw] h-[32vw] rounded-full bg-primary/25 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        OVERVIEW
      </div>

      <div className="absolute inset-0 z-10 grid grid-cols-2 items-center gap-[5vw] px-[8vw]">
        <div>
          <div className="text-[1.1vw] font-semibold tracking-[0.25em] text-accent mb-[2vh]">
            WHAT OMNICON DOES
          </div>
          <h2 className="text-[3.6vw] font-extrabold tracking-tight leading-[1.05] [text-wrap:balance]">
            A harness between a draft and an approved summary
          </h2>
          <p className="mt-[3vh] text-[1.5vw] text-white/65 leading-relaxed max-w-[36vw] [text-wrap:pretty]">
            A human-in-the-loop loop that sits between a draft summary and an
            approved one.
          </p>

          <div className="mt-[4vh] flex flex-col gap-[2.2vh]">
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-primary shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug">
                Ingest a meeting transcript + V1 summary
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-primary shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug">
                Reviewer gives grounded feedback (tied to transcript quotes)
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-primary shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug">
                A live LLM engine regenerates a scoped V2
              </p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <span className="mt-[0.6vh] w-[0.8vw] h-[0.8vw] rounded-full bg-primary shrink-0" />
              <p className="text-[1.6vw] text-white/80 leading-snug">
                Reviewer sees the diff + run telemetry, then approves
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[1.8vh]">
          <div className="rounded-[1vw] border border-white/10 bg-panel px-[2vw] py-[2.4vh]">
            <div className="text-[0.85vw] font-semibold tracking-[0.25em] text-muted">
              STEP 01
            </div>
            <div className="mt-[0.6vh] text-[1.6vw] font-bold">Draft</div>
          </div>
          <div className="self-center h-[2vh] w-[2px] bg-white/15" />
          <div className="rounded-[1vw] border border-white/10 bg-panel px-[2vw] py-[2.4vh]">
            <div className="text-[0.85vw] font-semibold tracking-[0.25em] text-muted">
              STEP 02
            </div>
            <div className="mt-[0.6vh] text-[1.6vw] font-bold">Feedback</div>
          </div>
          <div className="self-center h-[2vh] w-[2px] bg-white/15" />
          <div className="rounded-[1vw] border border-accent/40 bg-accent/10 px-[2vw] py-[2.4vh]">
            <div className="text-[0.85vw] font-semibold tracking-[0.25em] text-accent">
              STEP 03
            </div>
            <div className="mt-[0.6vh] text-[1.6vw] font-bold text-white">
              Regenerate
            </div>
          </div>
          <div className="self-center h-[2vh] w-[2px] bg-white/15" />
          <div className="rounded-[1vw] border border-white/10 bg-panel px-[2vw] py-[2.4vh]">
            <div className="text-[0.85vw] font-semibold tracking-[0.25em] text-muted">
              STEP 04
            </div>
            <div className="mt-[0.6vh] text-[1.6vw] font-bold">Review</div>
          </div>
          <div className="self-center h-[2vh] w-[2px] bg-white/15" />
          <div className="rounded-[1vw] border border-primary/40 bg-primary/10 px-[2vw] py-[2.4vh]">
            <div className="text-[0.85vw] font-semibold tracking-[0.25em] text-primary">
              STEP 05
            </div>
            <div className="mt-[0.6vh] text-[1.6vw] font-bold text-white">
              Approve
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        03 / 09
      </div>
    </div>
  );
}
