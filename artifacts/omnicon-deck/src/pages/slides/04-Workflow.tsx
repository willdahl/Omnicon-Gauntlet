export default function WorkflowSlide() {
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
        className="absolute -top-[18vh] -left-[6vw] w-[30vw] h-[30vw] rounded-full bg-primary/20 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        THE WORKFLOW
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-[7vw]">
        <div className="text-[1.1vw] font-semibold tracking-[0.25em] text-accent mb-[1.5vh]">
          SIX GUIDED STAGES
        </div>
        <h2 className="text-[3.6vw] font-extrabold tracking-tight leading-[1.05] mb-[5vh]">
          The review workflow, start to approval
        </h2>

        <div className="grid grid-cols-3 gap-[1.8vw]">
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[2.4vw] font-extrabold text-primary leading-none">01</div>
            <div className="mt-[1.4vh] text-[1.5vw] font-bold">Source</div>
            <p className="mt-[0.8vh] text-[1.5vw] text-white/60 leading-snug">
              Pick the meeting data source (+ optional guardrail test suite)
            </p>
          </div>
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[2.4vw] font-extrabold text-primary leading-none">02</div>
            <div className="mt-[1.4vh] text-[1.5vw] font-bold">Conversation</div>
            <p className="mt-[0.8vh] text-[1.5vw] text-white/60 leading-snug">
              Choose the meeting to review
            </p>
          </div>
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[2.4vw] font-extrabold text-primary leading-none">03</div>
            <div className="mt-[1.4vh] text-[1.5vw] font-bold">Model</div>
            <p className="mt-[0.8vh] text-[1.5vw] text-white/60 leading-snug">
              Select the LLM (Fast vs. Powerful tiers)
            </p>
          </div>
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[2.4vw] font-extrabold text-accent leading-none">04</div>
            <div className="mt-[1.4vh] text-[1.5vw] font-bold">Review</div>
            <p className="mt-[0.8vh] text-[1.5vw] text-white/60 leading-snug">
              Read V1, give grounded feedback
            </p>
          </div>
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[2.4vw] font-extrabold text-accent leading-none">05</div>
            <div className="mt-[1.4vh] text-[1.5vw] font-bold">Diff</div>
            <p className="mt-[0.8vh] text-[1.5vw] text-white/60 leading-snug">
              Compare V1 vs V2, read the change explanation
            </p>
          </div>
          <div className="rounded-[1vw] border border-accent/40 bg-accent/10 p-[1.8vw]">
            <div className="text-[2.4vw] font-extrabold text-accent leading-none">06</div>
            <div className="mt-[1.4vh] text-[1.5vw] font-bold">Output</div>
            <p className="mt-[0.8vh] text-[1.5vw] text-white/70 leading-snug">
              Approve and view telemetry
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        04 / 09
      </div>
    </div>
  );
}
