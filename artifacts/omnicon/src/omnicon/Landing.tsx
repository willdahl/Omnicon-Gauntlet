import { useEffect, useState } from "react";
import { Wordmark, Button, Badge } from "./ui";
import "./omnicon.css";
import {
  ArrowRight,
  MessageSquareText,
  GitCompareArrows,
  Cpu,
  Activity,
  ShieldCheck,
  FileWarning,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// OMNICON marketing landing page. Lives "upstream" of the review harness — it
// introduces the product and hands the visitor into the existing step machine
// via any of the "Get Started" actions (sticky header + hero + floating + CTA
// band). Purely presentational; it triggers `onGetStarted` to enter the app.
// ---------------------------------------------------------------------------

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessageSquareText,
    title: "Human-in-the-loop feedback",
    body: "Read the AI summary, mark what's wrong or missing, and type plain-language feedback. OMNICON folds your corrections into a regenerated V2 — no prompt engineering required.",
  },
  {
    icon: Cpu,
    title: "Model comparison",
    body: "Run the same transcript and feedback through Claude, GPT, or Gemini. Compare how each model interprets your corrections before committing to a verified output.",
  },
  {
    icon: GitCompareArrows,
    title: "Diff review",
    body: "Every regeneration ships with a line- and word-level diff against V1, so you see exactly what changed in the summary and transcript — additions, removals, and rewrites.",
  },
  {
    icon: Activity,
    title: "Output observability",
    body: "Inspect tokens, cost, latency, finish reason, and the model's reasoning for each run. Know what the model did and what it cost before you trust the result.",
  },
  {
    icon: ShieldCheck,
    title: "Guardrails",
    body: "Locatability and grounding checks keep regenerations honest — corrections must map to real content and stay grounded in the source, not invented from thin air.",
  },
  {
    icon: Sparkles,
    title: "Verified V2",
    body: "The result isn't a black-box rewrite. It's a reviewed, diffed, and observable second pass you can approve with confidence and hand off.",
  },
];

// Large brand mark for the hero — the logo glyph from the header, scaled up so
// OMNICON's branding anchors the main content, not just the top nav.
function HeroMark() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid h-14 w-14 place-items-center rounded-xl border border-[#2E3749] bg-[#12161F] shadow-[0_0_0_1px_rgba(94,234,212,0.12),0_0_50px_-12px_rgba(94,234,212,0.4)]">
        <div className="h-6 w-6 rounded-full border-2 border-[#5EEAD4]" />
        <div className="absolute h-2 w-2 rounded-full bg-[#5EEAD4]" />
      </div>
      <div className="omni-mono text-[22px] font-semibold tracking-[0.28em] text-[#E6E9EF]">
        OMNICON
      </div>
    </div>
  );
}

// Section eyebrow — larger and higher-contrast than the original faint label so
// section headers read clearly.
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="omni-mono mb-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#5EEAD4]">
      {children}
    </div>
  );
}

export function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  // Surface the sticky CTA bar's elevation only once the hero is out of view,
  // so the top of the page stays clean and the bar reads as "pinned" on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="omni-root min-h-screen text-[#E6E9EF]">
      {/* Sticky header with persistent Get Started CTA */}
      <header
        className={`sticky top-0 z-40 border-b transition-colors ${
          scrolled
            ? "border-[#1B212D] bg-[#0B0E14]/85 backdrop-blur"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Wordmark />
          <div className="flex items-center gap-3">
            <a
              href="#how-it-works"
              className="hidden text-[13px] text-[#9AA4B5] transition-colors hover:text-[#E6E9EF] sm:block"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hidden text-[13px] text-[#9AA4B5] transition-colors hover:text-[#E6E9EF] sm:block"
            >
              Features
            </a>
            <Button variant="primary" size="sm" onClick={onGetStarted}>
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="omni-grid-bg relative overflow-hidden border-b border-[#161B25]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0D13]" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            {/* Hero brand mark — branding lives in the content, not just the header */}
            <HeroMark />
            <Badge tone="accent" className="mx-auto mt-8">
              <span className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
              Human-in-the-loop post-processor for AI meeting notes
            </Badge>
            <h1 className="mt-6 text-[32px] font-semibold leading-[1.12] tracking-tight text-[#E6E9EF] sm:text-[48px]">
              Make sure your AI meeting notes{" "}
              <span className="text-[#5EEAD4]">get it right</span>
              <br className="hidden sm:block" /> — refine, review, template, and
              benchmark.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-[#9AA4B5] sm:text-[17px]">
              AI summaries are static and sometimes wrong. OMNICON puts a human in
              the loop: ingest a transcript and its summary, give feedback in plain
              language, and regenerate a verified V2 you can review diff-by-diff.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                onClick={onGetStarted}
                className="w-full px-6 py-3 text-[14px] sm:w-auto"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2E3749] bg-[#171C28] px-6 py-3 text-[14px] text-[#E6E9EF] transition-colors hover:bg-[#1C2230] sm:w-auto"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-[#161B25]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div>
              <SectionEyebrow>The problem</SectionEyebrow>
              <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-[#E6E9EF] sm:text-[32px]">
                The summary ships once — mistakes and all.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#9AA4B5]">
                Tools like Granola, Otter, and Fireflies generate a tidy summary
                the moment a meeting ends. But that output is frozen: a misheard
                name, a dropped decision, or a hallucinated action item just sits
                there. There's no clean way to say "that's wrong, fix it" and get
                a trustworthy second pass.
              </p>
            </div>
            <div className="rounded-xl border border-[#232A38] bg-[#12161F] p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#854D0E] bg-[#854D0E]/20 text-[#FBBF24]">
                  <FileWarning className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#E6E9EF]">
                    Static & sometimes wrong
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#9AA4B5]">
                    A V1 summary can misattribute a quote or invent a follow-up.
                    Once it's saved, that error becomes the record of the meeting.
                  </p>
                </div>
              </div>
              <div className="my-5 h-px bg-[#1B212D]" />
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#0F766E] bg-[#0F766E]/20 text-[#5EEAD4]">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#E6E9EF]">
                    Corrected & verified V2
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#9AA4B5]">
                    OMNICON takes your feedback, regenerates the notes, and shows
                    you exactly what changed — so the record is right.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-[#161B25]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="max-w-2xl">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-[#E6E9EF] sm:text-[32px]">
              From raw transcript to a verified second pass.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#9AA4B5]">
              OMNICON routes every conversation through a six-step harness. You
              stay in control at each handoff.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Ingest the source",
                body: "Pull a transcript and its V1 summary from a connected notes tool like Granola.",
              },
              {
                step: "02",
                title: "Pick the conversation",
                body: "Select the meeting you want to review from your indexed conversations.",
              },
              {
                step: "03",
                title: "Choose a model",
                body: "Route the run through Claude, GPT, or Gemini — whichever you trust for the job.",
              },
              {
                step: "04",
                title: "Give feedback",
                body: "Read the summary and type plain-language corrections as you go.",
              },
              {
                step: "05",
                title: "Review the diff",
                body: "See line- and word-level changes between V1 and the regenerated V2.",
              },
              {
                step: "06",
                title: "Inspect the output",
                body: "Check tokens, cost, latency, and reasoning, then approve the verified result.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-[#232A38] bg-[#12161F] p-5"
              >
                <div className="omni-mono text-[12px] font-semibold tracking-[0.1em] text-[#5EEAD4]">
                  {s.step}
                </div>
                <div className="mt-3 text-[15px] font-semibold text-[#E6E9EF]">
                  {s.title}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#9AA4B5]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-[#161B25]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="max-w-2xl">
            <SectionEyebrow>What it offers</SectionEyebrow>
            <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-[#E6E9EF] sm:text-[32px]">
              Built for people who can't afford to be wrong.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#9AA4B5]">
              Every regeneration is reviewable, comparable, and observable — not a
              black box.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-xl border border-[#232A38] bg-[#12161F] p-6 transition-colors hover:border-[#2E3749]"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#0F766E] bg-[#0F766E]/20 text-[#5EEAD4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-[15px] font-semibold text-[#E6E9EF]">
                    {f.title}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#9AA4B5]">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA band */}
      <section className="border-b border-[#161B25]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="omni-grid-bg relative overflow-hidden rounded-2xl border border-[#232A38] bg-[#12161F] px-6 py-12 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#5EEAD4]/8 via-transparent to-transparent" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-[#E6E9EF] sm:text-[36px]">
                Stop trusting the first draft.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#9AA4B5]">
                Run a meeting through the review harness and see the difference a
                verified V2 makes.
              </p>
              <div className="mt-8 flex justify-center">
                <Button
                  variant="primary"
                  onClick={onGetStarted}
                  className="px-7 py-3 text-[14px]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1B212D]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
          <Wordmark />
          <div className="omni-mono text-[11px] uppercase tracking-[0.16em] text-[#5E6675]">
            Review harness for AI meeting notes
          </div>
        </div>
      </footer>

      {/* Floating Get Started — persistent on mobile while scrolling */}
      <button
        onClick={onGetStarted}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-transparent bg-[#5EEAD4] px-5 py-3 text-[13px] font-semibold text-[#06201C] shadow-[0_8px_24px_-6px_rgba(94,234,212,0.5)] transition-colors hover:bg-[#7af0de] sm:hidden"
      >
        Get Started
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
