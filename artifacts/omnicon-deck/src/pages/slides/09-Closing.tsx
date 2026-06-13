export default function ClosingSlide() {
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
        BY DESIGN
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-[10vw]">
        <h2 className="text-[5vw] font-extrabold tracking-tight leading-[1.02] max-w-[70vw] [text-wrap:balance]">
          Trustworthy revision, by design
        </h2>
        <p className="mt-[3vh] text-[1.7vw] text-white/65 max-w-[52vw] leading-relaxed">
          OMNICON makes AI meeting notes safe to rely on.
        </p>

        <div className="mt-[5vh] flex flex-col gap-[2.4vh] max-w-[60vw]">
          <div className="flex items-start gap-[1.2vw]">
            <span className="mt-[0.7vh] w-[0.9vw] h-[0.9vw] rounded-full bg-primary shrink-0" />
            <p className="text-[1.6vw] text-white/85 leading-snug">
              Humans stay in the loop — nothing is approved unseen
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <span className="mt-[0.7vh] w-[0.9vw] h-[0.9vw] rounded-full bg-primary shrink-0" />
            <p className="text-[1.6vw] text-white/85 leading-snug">
              Edits are scoped, grounded, and guardrailed
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <span className="mt-[0.7vh] w-[0.9vw] h-[0.9vw] rounded-full bg-primary shrink-0" />
            <p className="text-[1.6vw] text-white/85 leading-snug">
              Every change is visible; every run is measured
            </p>
          </div>
        </div>

        <div className="mt-[6vh] border-l-2 border-accent pl-[2vw] max-w-[60vw]">
          <p className="text-[1.9vw] font-semibold text-white leading-snug [text-wrap:balance]">
            Generation is easy. Trusted revision is the hard part — that's
            OMNICON.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] text-[1vw] text-muted z-10">
        AI meeting notes, safe to rely on
      </div>
      <div className="absolute bottom-[5vh] right-[5vw] text-[1vw] font-medium text-muted z-10">
        09 / 09
      </div>
    </div>
  );
}
