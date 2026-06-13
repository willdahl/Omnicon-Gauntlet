import { cn } from "@/lib/utils";
import "./omnicon.css";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

// ---------------------------------------------------------------------------
// OMNICON shared UI primitives. Every screen composes these so the 6 screens
// share one design language: a dark "operator console" for reviewing AI
// meeting summaries.
// ---------------------------------------------------------------------------

export const PIPELINE_STEPS = [
  "Source",
  "Conversation",
  "Model",
  "Review",
  "Diff",
  "Output",
] as const;

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid h-7 w-7 place-items-center rounded-md border border-[#2E3749] bg-[#12161F]">
        <div className="h-3 w-3 rounded-full border-2 border-[#5EEAD4]" />
        <div className="absolute h-1 w-1 rounded-full bg-[#5EEAD4]" />
      </div>
      <div className="leading-none">
        <div className="omni-mono text-[15px] font-semibold tracking-[0.22em] text-[#E6E9EF]">
          OMNICON
        </div>
        <div className="omni-mono mt-1 text-[9px] uppercase tracking-[0.34em] text-[#5E6675]">
          review harness
        </div>
      </div>
    </div>
  );
}

export function PipelineRail({
  current,
  onStepClick,
}: {
  current: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <div className="flex items-center">
      {PIPELINE_STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "todo";
        const clickable = !!onStepClick && n <= current;
        const node = (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full border omni-mono text-[11px] font-semibold transition-colors",
                state === "active" && "border-[#5EEAD4] bg-[#5EEAD4] text-[#06201C]",
                state === "done" && "border-[#0F766E] bg-[#0F766E]/30 text-[#5EEAD4]",
                state === "todo" && "border-[#2E3749] bg-transparent text-[#5E6675]",
              )}
            >
              {state === "done" ? <Check className="h-3 w-3" /> : n}
            </div>
            <span
              className={cn(
                "text-[12px] font-medium",
                state === "active" && "text-[#E6E9EF]",
                state === "done" && "text-[#9AA4B5]",
                state === "todo" && "text-[#5E6675]",
              )}
            >
              {label}
            </span>
          </div>
        );
        return (
          <div key={label} className="flex items-center">
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(n)}
                className="rounded-md transition-opacity hover:opacity-80"
                title={`Go to ${label}`}
              >
                {node}
              </button>
            ) : (
              node
            )}
            {i < PIPELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px w-7",
                  n < current ? "bg-[#0F766E]" : "bg-[#232A38]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AppFrame({
  step,
  title,
  subtitle,
  headerRight,
  footer,
  onStepClick,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  onStepClick?: (step: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="omni-root omni-scroll flex h-screen flex-col overflow-hidden text-[#E6E9EF]">
      {/* Top chrome */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1B212D] bg-[#0B0E14]/80 px-6 backdrop-blur">
        <Wordmark />
        <PipelineRail current={step} onStepClick={onStepClick} />
        <div className="flex min-w-[120px] items-center justify-end">
          <Badge tone="neutral">
            <span className="omni-mono text-[10px]">
              STEP {step}/6
            </span>
          </Badge>
        </div>
      </header>

      {/* Sub header */}
      <div className="flex shrink-0 items-end justify-between border-b border-[#161B25] px-6 py-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight text-[#E6E9EF]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-[13px] text-[#9AA4B5]">{subtitle}</p>
          )}
        </div>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>

      {/* Body */}
      <main className="omni-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer className="flex h-16 shrink-0 items-center justify-between border-t border-[#1B212D] bg-[#0B0E14]/80 px-6 backdrop-blur">
          {footer}
        </footer>
      )}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  right,
  children,
  className,
  bodyClassName,
  padded = true,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-[#232A38] bg-[#12161F]",
        className,
      )}
    >
      {(title || right) && (
        <div className="flex shrink-0 items-center justify-between border-b border-[#1B212D] px-4 py-3">
          <div>
            {title && (
              <div className="text-[13px] font-semibold text-[#E6E9EF]">{title}</div>
            )}
            {subtitle && (
              <div className="mt-0.5 text-[11px] text-[#5E6675]">{subtitle}</div>
            )}
          </div>
          {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
      )}
      <div className={cn(padded && "p-4", "min-h-0 flex-1", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

const TONE: Record<string, string> = {
  accent: "border-[#0F766E] bg-[#0F766E]/20 text-[#5EEAD4]",
  neutral: "border-[#2A3142] bg-[#171C28] text-[#9AA4B5]",
  green: "border-[#166534] bg-[#166534]/20 text-[#4ADE80]",
  red: "border-[#7F1D1D] bg-[#7F1D1D]/20 text-[#F87171]",
  amber: "border-[#854D0E] bg-[#854D0E]/20 text-[#FBBF24]",
  outline: "border-[#2E3749] bg-transparent text-[#9AA4B5]",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof TONE;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
const BTN: Record<BtnVariant, string> = {
  primary:
    "bg-[#5EEAD4] text-[#06201C] hover:bg-[#7af0de] border border-transparent font-semibold",
  secondary:
    "bg-[#171C28] text-[#E6E9EF] hover:bg-[#1C2230] border border-[#2E3749]",
  ghost:
    "bg-transparent text-[#9AA4B5] hover:text-[#E6E9EF] hover:bg-[#171C28] border border-transparent",
  danger:
    "bg-transparent text-[#F87171] hover:bg-[#7F1D1D]/20 border border-[#7F1D1D]",
};

export function Button({
  variant = "secondary",
  children,
  className,
  size = "md",
  onClick,
}: {
  variant?: BtnVariant;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-colors",
        size === "sm" ? "px-3 py-1.5 text-[12px]" : "px-4 py-2 text-[13px]",
        BTN[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#232A38] bg-[#12161F] px-4 py-3",
        className,
      )}
    >
      <div className="omni-mono text-[10px] uppercase tracking-[0.16em] text-[#5E6675]">
        {label}
      </div>
      <div className="omni-mono mt-1.5 text-[18px] font-semibold text-[#E6E9EF]">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-[#5E6675]">{sub}</div>}
    </div>
  );
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#2E3749] bg-[#171C28] omni-mono text-[10px] font-semibold text-[#9AA4B5]",
        className,
      )}
    >
      {initials}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="omni-mono mb-2 text-[10px] uppercase tracking-[0.18em] text-[#5E6675]">
      {children}
    </div>
  );
}
