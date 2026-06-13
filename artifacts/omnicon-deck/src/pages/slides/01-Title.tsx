export default function TitleSlide() {
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
        className="absolute -top-[18vh] -left-[10vw] w-[36vw] h-[36vw] rounded-full bg-primary/30 z-0"
        style={{ filter: "blur(9vw)" }}
      />
      <div
        className="absolute -bottom-[22vh] -right-[8vw] w-[34vw] h-[34vw] rounded-full bg-accent/30 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        REVIEW HARNESS
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-[10vw]">
        <div className="inline-flex self-start items-center gap-[0.7vw] rounded-full border border-white/15 bg-panel/60 px-[1.4vw] py-[0.8vh] mb-[4vh]">
          <span className="w-[0.7vw] h-[0.7vw] rounded-full bg-accent" />
          <span className="text-[1.1vw] font-medium text-white/80">
            Human-in-the-loop meeting intelligence
          </span>
        </div>

        <h1 className="text-[10vw] font-extrabold tracking-tighter leading-[0.95]">
          OMNICON
        </h1>

        <p className="mt-[3vh] text-[2.4vw] font-semibold text-white max-w-[60vw] [text-wrap:balance]">
          A review harness for AI-generated meeting notes.
        </p>
        <p className="mt-[2vh] text-[1.5vw] text-white/65 max-w-[55vw] leading-relaxed [text-wrap:pretty]">
          Turn reviewer feedback into trustworthy, regenerated summaries — with
          guardrails, diffs, and full observability.
        </p>

        <div className="mt-[5vh] flex items-center gap-[1.2vw]">
          <span className="rounded-full border border-white/12 bg-panel px-[1.6vw] py-[1vh] text-[1.1vw] font-medium text-white/80">
            Guardrails
          </span>
          <span className="rounded-full border border-white/12 bg-panel px-[1.6vw] py-[1vh] text-[1.1vw] font-medium text-white/80">
            Side-by-side diffs
          </span>
          <span className="rounded-full border border-white/12 bg-panel px-[1.6vw] py-[1vh] text-[1.1vw] font-medium text-white/80">
            Full observability
          </span>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        01 / 09
      </div>
    </div>
  );
}
