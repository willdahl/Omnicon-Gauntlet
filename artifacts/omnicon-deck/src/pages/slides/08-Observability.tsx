export default function ObservabilitySlide() {
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
        className="absolute -bottom-[20vh] -left-[8vw] w-[32vw] h-[32vw] rounded-full bg-primary/20 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        OBSERVABILITY
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-[7vw]">
        <div className="text-[1.1vw] font-semibold tracking-[0.25em] text-accent mb-[1.5vh]">
          NO BLACK BOX
        </div>
        <h2 className="text-[3.6vw] font-extrabold tracking-tight leading-[1.05] mb-[5vh]">
          Every regeneration is fully measured
        </h2>

        <div className="grid grid-cols-3 gap-[1.8vw]">
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[0.95vw] font-semibold tracking-[0.2em] text-muted">
              LATENCY
            </div>
            <div className="mt-[1vh] text-[1.7vw] font-bold">Milliseconds</div>
          </div>
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[0.95vw] font-semibold tracking-[0.2em] text-muted">
              COST
            </div>
            <div className="mt-[1vh] text-[1.7vw] font-bold">USD per run</div>
          </div>
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[0.95vw] font-semibold tracking-[0.2em] text-muted">
              TOKENS
            </div>
            <div className="mt-[1vh] text-[1.7vw] font-bold">
              Input / Output / Total
            </div>
          </div>
          <div className="rounded-[1vw] border border-white/10 bg-panel p-[1.8vw]">
            <div className="text-[0.95vw] font-semibold tracking-[0.2em] text-muted">
              FINISH REASON
            </div>
            <div className="mt-[1vh] text-[1.7vw] font-bold">Run status</div>
          </div>
          <div className="rounded-[1vw] border border-accent/40 bg-accent/10 p-[1.8vw]">
            <div className="text-[0.95vw] font-semibold tracking-[0.2em] text-accent">
              MODEL REASONING
            </div>
            <div className="mt-[1vh] text-[1.7vw] font-bold">
              Chain-of-thought panel
            </div>
          </div>
          <div className="rounded-[1vw] border border-primary/40 bg-primary/10 p-[1.8vw]">
            <div className="text-[0.95vw] font-semibold tracking-[0.2em] text-primary">
              EXPORT
            </div>
            <div className="mt-[1vh] text-[1.7vw] font-bold">
              Summary, transcript, notes, logs (.json)
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        08 / 09
      </div>
    </div>
  );
}
