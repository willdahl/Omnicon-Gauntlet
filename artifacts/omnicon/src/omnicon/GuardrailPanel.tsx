import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FlaskConical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GUARDRAIL_META_MAP, type TestExpected } from "./guardrail-meta";

export type TestStatus = "pending" | "running" | "pass" | "fail";

export interface TestTelemetry {
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCostUsd: number | null;
}

export interface TestCaseRow {
  id: string;
  guardrail: string;
  status: TestStatus;
  reason?: string;
  telemetry?: TestTelemetry;
  description?: string;
  inputTranscript?: string;
  inputSummary?: string;
  feedback?: string;
  outputTranscript?: string;
  outputSummary?: string;
  expected?: TestExpected;
}

interface Summary {
  total: number;
  passed: number;
  failed: number;
}

function StatusBadge({ status }: { status: TestStatus }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#2E3749] bg-[#171C28] px-2 py-0.5 text-[11px] text-[#5E6675]">
        <Clock className="h-3 w-3" />
        pending
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#2E3749] bg-[#171C28] px-2 py-0.5 text-[11px] text-[#5EEAD4]">
        <Loader2 className="h-3 w-3 animate-spin" />
        running
      </span>
    );
  }
  if (status === "pass") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#14532D] bg-[#14532D]/30 px-2 py-0.5 text-[11px] text-[#4ADE80]">
        <CheckCircle2 className="h-3 w-3" />
        pass
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#7F1D1D] bg-[#7F1D1D]/30 px-2 py-0.5 text-[11px] text-[#F87171]">
      <XCircle className="h-3 w-3" />
      fail
    </span>
  );
}

function TelemetryLine({ telemetry }: { telemetry: TestTelemetry }) {
  const cost =
    telemetry.estimatedCostUsd !== null
      ? `$${telemetry.estimatedCostUsd.toFixed(4)}`
      : "—";
  const latency =
    telemetry.latencyMs > 0 ? `${(telemetry.latencyMs / 1000).toFixed(1)}s` : "—";
  const model = telemetry.model.split("/").pop() ?? telemetry.model;

  return (
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 omni-mono text-[10px] text-[#5E6675]">
      <span>{model}</span>
      <span>{telemetry.inputTokens + telemetry.outputTokens} tok</span>
      <span>{latency}</span>
      <span>{cost}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#3D4A5E]">
        {label}
      </p>
      {children}
    </div>
  );
}

function TextBlock({ value }: { value?: string }) {
  if (!value) {
    return (
      <p className="omni-mono text-[11px] italic text-[#3D4A5E]">— awaiting run</p>
    );
  }
  return (
    <pre className="omni-mono max-h-[9rem] overflow-y-auto rounded-md border border-[#1B212D] bg-[#080B11] px-3 py-2 text-[11px] leading-relaxed text-[#7A8494] whitespace-pre-wrap break-words">
      {value}
    </pre>
  );
}

function sideEffectLabel(effect: string): string {
  switch (effect) {
    case "pipeline_blocked": return "blocks pipeline";
    case "pipeline_not_blocked": return "must pass through";
    case "no_content_added": return "must produce no changes";
    default: return effect;
  }
}

function ExpectedList({ expected }: { expected: TestExpected }) {
  const items: string[] = [];

  for (const reason of expected.flagged_reasons ?? []) {
    items.push(`flags: ${reason}`);
  }
  for (const effect of expected.side_effects ?? []) {
    items.push(sideEffectLabel(effect));
  }
  for (const span of expected.edited_spans ?? []) {
    if (span.present) {
      items.push(`must contain "${span.substring}"`);
    } else {
      items.push(`must NOT contain "${span.substring}"`);
    }
  }

  if (items.length === 0) {
    return (
      <p className="omni-mono text-[11px] italic text-[#3D4A5E]">— none</p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#9AA4B5]">
          <span className="mt-[2px] shrink-0 text-[#3D4A5E]">·</span>
          <span className="omni-mono">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TestRow({ row, expanded, onToggle }: { row: TestCaseRow; expanded: boolean; onToggle: () => void }) {
  const hasResult = !!(row.reason || row.telemetry);
  const hasDetail = !!(
    row.description ||
    row.inputTranscript ||
    row.inputSummary ||
    row.feedback ||
    row.outputTranscript ||
    row.outputSummary ||
    row.expected ||
    hasResult
  );

  return (
    <div
      className={cn(
        "border-b border-[#1B212D] last:border-b-0",
        row.status === "running" && "bg-[#0F766E]/5",
      )}
    >
      <button
        onClick={hasDetail ? onToggle : undefined}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left",
          hasDetail && "cursor-pointer hover:bg-[#12161F]/60",
          !hasDetail && "cursor-default",
        )}
      >
        <span className="omni-mono shrink-0 text-[11px] font-semibold text-[#5E6675] w-10">
          {row.id}
        </span>
        <span className="flex-1 text-[13px] text-[#9AA4B5] min-w-0 truncate pr-2">
          {row.guardrail}
        </span>
        <StatusBadge status={row.status} />
        {hasDetail && (
          <span className="ml-1 shrink-0 text-[#5E6675]">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </button>

      {expanded && hasDetail && (
        <div className="px-4 pb-4 pt-0 pl-[3.25rem] space-y-3">
          {row.description && (
            <Field label="Description">
              <p className="text-[12px] leading-relaxed text-[#9AA4B5]">
                {row.description}
              </p>
            </Field>
          )}

          <Field label="Input Transcript">
            <TextBlock value={row.inputTranscript} />
          </Field>

          <Field label="Input Summary">
            <TextBlock value={row.inputSummary} />
          </Field>

          <Field label="User Feedback">
            <TextBlock value={row.feedback} />
          </Field>

          <Field label="Output Transcript">
            <TextBlock value={row.outputTranscript} />
          </Field>

          <Field label="Output Summary">
            <TextBlock value={row.outputSummary} />
          </Field>

          {row.expected && (
            <Field label="Expected">
              <ExpectedList expected={row.expected} />
            </Field>
          )}

          {hasResult && (
            <Field label="Test Result">
              {row.status === "pass" && !row.reason && (
                <p className="text-[12px] text-[#4ADE80]">✓ pass</p>
              )}
              {row.reason && (
                <p className="text-[12px] leading-relaxed text-[#F87171]">
                  {row.reason}
                </p>
              )}
              {row.telemetry && <TelemetryLine telemetry={row.telemetry} />}
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

const ALL_CASE_IDS = ["G1", "G2", "G3", "G4-A", "G4-B", "G5-A", "G5-B", "G5-C"];

/**
 * Merge a streamed row into the existing one, keeping previously-known fields
 * (e.g. the input metadata shown before the run) when a later event omits them.
 */
function mergeRow(base: TestCaseRow, incoming: TestCaseRow): TestCaseRow {
  return {
    ...base,
    ...incoming,
    description: incoming.description ?? base.description,
    inputTranscript: incoming.inputTranscript ?? base.inputTranscript,
    inputSummary: incoming.inputSummary ?? base.inputSummary,
    feedback: incoming.feedback ?? base.feedback,
    outputTranscript: incoming.outputTranscript ?? base.outputTranscript,
    outputSummary: incoming.outputSummary ?? base.outputSummary,
    expected: incoming.expected ?? base.expected,
  };
}

function buildInitialRows(): TestCaseRow[] {
  return ALL_CASE_IDS.map((id) => {
    const meta = GUARDRAIL_META_MAP.get(id);
    return {
      id,
      guardrail: meta?.guardrail ?? "",
      status: "pending",
      description: meta?.description,
      inputTranscript: meta?.inputTranscript,
      inputSummary: meta?.inputSummary,
      feedback: meta?.feedback,
      expected: meta?.expected,
    };
  });
}

export function GuardrailPanel({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<TestCaseRow[]>(buildInitialRows);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [runState, setRunState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRunState("running");

    (async () => {
      try {
        const res = await fetch("/api/guardrails/run-tests", {
          method: "POST",
          signal: ctrl.signal,
          headers: { Accept: "text/event-stream" },
        });

        if (res.status === 403) {
          throw new Error("Test suite is disabled on this server (DEMO_MODE=false).");
        }

        if (!res.ok || !res.body) {
          throw new Error(`Server returned ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const events = buf.split("\n\n");
          buf = events.pop() ?? "";

          for (const block of events) {
            const eventMatch = block.match(/^event: (\w+)/m);
            const dataMatch = block.match(/^data: (.+)$/m);
            if (!eventMatch || !dataMatch) continue;

            const eventType = eventMatch[1];
            let payload: unknown;
            try {
              payload = JSON.parse(dataMatch[1]);
            } catch {
              continue;
            }

            if (eventType === "progress") {
              const p = payload as TestCaseRow;
              setRows((prev) =>
                prev.map((r) => (r.id === p.id ? mergeRow(r, p) : r)),
              );
              if (p.status === "fail") {
                setExpandedIds((prev) => new Set([...prev, p.id]));
              }
            } else if (eventType === "complete") {
              const c = payload as { results: TestCaseRow[]; summary: Summary };
              setRows((prev) =>
                c.results.map((incoming) => {
                  const existing = prev.find((r) => r.id === incoming.id);
                  return existing
                    ? mergeRow(existing, incoming)
                    : incoming;
                }),
              );
              setSummary(c.summary);
              setRunState("done");
            } else if (eventType === "error") {
              const e = payload as { message: string };
              setErrorMsg(e.message);
              setRunState("error");
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setErrorMsg((err as Error).message ?? "Unknown error");
        setRunState("error");
      }
    })();

    return () => ctrl.abort();
  }, []);

  const passCount = summary?.passed ?? rows.filter((r) => r.status === "pass").length;
  const failCount = summary?.failed ?? rows.filter((r) => r.status === "fail").length;
  const total = 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#2E3749] bg-[#0B0E14] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#1B212D] px-5 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-[#2E3749] bg-[#12161F] text-[#5EEAD4]">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] font-semibold text-[#E6E9EF]">
              Guardrail Test Suite
            </h2>
            <p className="omni-mono text-[11px] text-[#5E6675]">
              8 cases · temperature=0 · pipeline scaffold
            </p>
          </div>
          <button
            onClick={handleClose}
            className="grid h-7 w-7 place-items-center rounded-lg border border-[#2E3749] text-[#5E6675] transition-colors hover:border-[#3D4A5E] hover:text-[#9AA4B5]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#1B212D] bg-[#0A0D13] px-5 py-3">
          {runState === "running" && (
            <span className="flex items-center gap-2 text-[12px] text-[#5EEAD4]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running…
            </span>
          )}
          {runState === "done" && (
            <span
              className={cn(
                "text-[12px] font-semibold",
                failCount === 0 ? "text-[#4ADE80]" : "text-[#F87171]",
              )}
            >
              {passCount}/{total} passed
            </span>
          )}
          {runState === "error" && (
            <span className="text-[12px] text-[#F87171]">
              Error: {errorMsg}
            </span>
          )}
          <div className="flex gap-3 ml-auto omni-mono text-[11px]">
            <span className="text-[#4ADE80]">{passCount} pass</span>
            <span className="text-[#F87171]">{failCount} fail</span>
            <span className="text-[#5E6675]">{total - passCount - failCount} pending</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-[#1B212D] shrink-0">
          <div
            className={cn(
              "h-full transition-all duration-500",
              failCount > 0 ? "bg-[#F87171]" : "bg-[#5EEAD4]",
            )}
            style={{ width: `${((passCount + failCount) / total) * 100}%` }}
          />
        </div>

        {/* Rows */}
        <div className="omni-scroll flex-1 overflow-y-auto">
          {rows.map((row) => (
            <TestRow
              key={row.id}
              row={row}
              expanded={expandedIds.has(row.id)}
              onToggle={() => toggleExpand(row.id)}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="shrink-0 border-t border-[#1B212D] px-5 py-3">
          <p className="text-[11px] leading-relaxed text-[#5E6675]">
            Failing cases show which guardrails need to be built — "fail" here means the guardrail stage is not yet implemented, not that the regeneration engine is broken.
          </p>
        </div>
      </div>
    </div>
  );
}
