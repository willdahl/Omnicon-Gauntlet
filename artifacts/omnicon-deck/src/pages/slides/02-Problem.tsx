export default function ProblemSlide() {
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
        className="absolute -top-[20vh] -right-[6vw] w-[34vw] h-[34vw] rounded-full bg-accent/25 z-0"
        style={{ filter: "blur(9vw)" }}
      />

      <div className="absolute top-[5vh] left-[5vw] flex items-center gap-[1vw] z-10">
        <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-primary" />
        <div className="text-[1.3vw] font-bold tracking-tight">OMNICON</div>
      </div>
      <div className="absolute top-[5vh] right-[5vw] text-[1vw] font-medium tracking-[0.3em] text-muted z-10">
        THE PROBLEM
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-[8vw]">
        <div className="text-[1.1vw] font-semibold tracking-[0.25em] text-accent mb-[2vh]">
          WHY THIS MATTERS
        </div>
        <h2 className="text-[4vw] font-extrabold tracking-tight leading-[1.05] max-w-[70vw] [text-wrap:balance]">
          AI summaries are fast — but can you trust them?
        </h2>

        <div className="mt-[6vh] grid grid-cols-2 gap-x-[4vw] gap-y-[3.5vh] max-w-[78vw]">
          <div className="flex items-start gap-[1.2vw]">
            <span className="mt-[0.6vh] w-[0.9vw] h-[0.9vw] rounded-full bg-accent shrink-0" />
            <p className="text-[1.6vw] text-white/75 leading-snug [text-wrap:pretty]">
              LLM meeting notes drift: wrong speaker attribution, fabricated
              facts, filler kept, key points dropped
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <span className="mt-[0.6vh] w-[0.9vw] h-[0.9vw] rounded-full bg-accent shrink-0" />
            <p className="text-[1.6vw] text-white/75 leading-snug [text-wrap:pretty]">
              "Just regenerate it" often rewrites the whole summary instead of
              fixing the one line you flagged
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <span className="mt-[0.6vh] w-[0.9vw] h-[0.9vw] rounded-full bg-accent shrink-0" />
            <p className="text-[1.6vw] text-white/75 leading-snug [text-wrap:pretty]">
              Reviewers have no safe way to give feedback and verify exactly what
              changed
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <span className="mt-[0.6vh] w-[0.9vw] h-[0.9vw] rounded-full bg-primary shrink-0" />
            <p className="text-[1.6vw] text-white font-semibold leading-snug [text-wrap:pretty]">
              The gap isn't generation — it's trusted revision
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        02 / 09
      </div>
    </div>
  );
}
