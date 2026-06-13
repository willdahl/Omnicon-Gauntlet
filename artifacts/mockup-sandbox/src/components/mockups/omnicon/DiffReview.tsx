import { useState } from "react";
import { FileText, MessageSquare, Eye, X, Check } from "lucide-react";
import { AppFrame, Panel, Badge, Button, SectionLabel } from "./_shared/ui";
import {
  SUMMARY_DIFF_PAIRS,
  TRANSCRIPT_DIFF_PAIRS,
  DIFF_TARGET_STATS,
  DIFF_CHANGE_SUMMARY,
} from "./_shared/mockData";
import type { DiffPair, DiffCell } from "./_shared/mockData";

const CELL_STYLE: Record<DiffCell["op"], string> = {
  same: "text-[#9AA4B5]",
  add: "bg-[#166534]/12 text-[#4ADE80]",
  remove: "bg-[#7F1D1D]/12 text-[#F87171]/90 line-through decoration-[#F87171]/40",
};

const GUTTER: Record<DiffCell["op"] | "empty", string> = {
  same: "text-[#3A4150]",
  add: "text-[#4ADE80]",
  remove: "text-[#F87171]",
  empty: "text-transparent",
};

function DiffCellView({ cell }: { cell: DiffCell | null | undefined }) {
  if (!cell) {
    // No counterpart on this side — render an empty, faintly striped cell.
    return (
      <div className="flex min-h-[2.25rem] items-stretch bg-[#0A0D13]/40">
        <div className="w-7 shrink-0" />
        <div className="flex-1" />
      </div>
    );
  }
  const mark = cell.op === "add" ? "+" : cell.op === "remove" ? "−" : "";
  return (
    <div className={"flex min-h-[2.25rem] items-start " + CELL_STYLE[cell.op]}>
      <div
        className={
          "omni-mono w-7 shrink-0 select-none px-2 py-1.5 text-center text-[12px] font-semibold " +
          GUTTER[cell.op]
        }
      >
        {mark}
      </div>
      <p className="flex-1 py-1.5 pr-3 text-[13px] leading-relaxed">{cell.text}</p>
    </div>
  );
}

function DiffTable({ pairs }: { pairs: DiffPair[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#232A38]">
      {/* Column headers */}
      <div className="grid grid-cols-2 border-b border-[#232A38] bg-[#0F141C]">
        <div className="border-r border-[#232A38] px-3 py-2">
          <span className="omni-mono text-[10px] uppercase tracking-[0.18em] text-[#5E6675]">
            V1 · before
          </span>
        </div>
        <div className="px-3 py-2">
          <span className="omni-mono text-[10px] uppercase tracking-[0.18em] text-[#5E6675]">
            V2 · after
          </span>
        </div>
      </div>

      {pairs.map((pair, i) =>
        pair.heading ? (
          <div
            key={i}
            className="border-b border-[#1B212D] bg-[#12161F] px-3 py-2"
          >
            <span className="omni-mono text-[10px] uppercase tracking-[0.18em] text-[#7C8699]">
              {pair.heading}
            </span>
          </div>
        ) : (
          <div
            key={i}
            className="grid grid-cols-2 border-b border-[#1B212D] last:border-b-0"
          >
            <div className="border-r border-[#232A38]">
              <DiffCellView cell={pair.left} />
            </div>
            <div>
              <DiffCellView cell={pair.right} />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export function DiffReview() {
  const [target, setTarget] = useState<"summary" | "transcript">("summary");
  const [mode, setMode] = useState<"diff" | "v1">("diff");

  const pairs =
    target === "summary" ? SUMMARY_DIFF_PAIRS : TRANSCRIPT_DIFF_PAIRS;
  const stats = DIFF_TARGET_STATS[target];
  const changes = DIFF_CHANGE_SUMMARY[target];

  return (
    <AppFrame
      step={5}
      title="Review changes"
      subtitle="V1 → V2 — confirm the corrections before approving."
      headerRight={
        <>
          <Badge tone="green">
            <span className="omni-mono">+{stats.additions}</span>
          </Badge>
          <Badge tone="red">
            <span className="omni-mono">−{stats.removals}</span>
          </Badge>
          <Badge tone="neutral">
            <span className="omni-mono">{stats.unchanged}</span> unchanged
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode((m) => (m === "diff" ? "v1" : "diff"))}
          >
            <Eye className="h-3.5 w-3.5" />
            {mode === "diff" ? "View V1 only" : "Back to diff"}
          </Button>
        </>
      }
      footer={
        <>
          <p className="text-[12px] text-[#5E6675]">
            Approving writes V2 back to the Granola note.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="danger">
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button variant="primary">
              <Check className="h-4 w-4" />
              Approve V2
            </Button>
          </div>
        </>
      }
    >
      <div className="mx-auto flex h-full min-h-0 max-w-5xl flex-col gap-4">
        {/* Target toggle: Summary diff | Transcript diff */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="inline-flex rounded-lg border border-[#2E3749] bg-[#0A0D13] p-1">
            <button
              onClick={() => setTarget("summary")}
              className={
                "inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-[12px] transition-colors " +
                (target === "summary"
                  ? "bg-[#5EEAD4] font-semibold text-[#06201C]"
                  : "font-medium text-[#9AA4B5] hover:text-[#E6E9EF]")
              }
            >
              <FileText className="h-3.5 w-3.5" />
              Summary diff
            </button>
            <button
              onClick={() => setTarget("transcript")}
              className={
                "inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-[12px] transition-colors " +
                (target === "transcript"
                  ? "bg-[#5EEAD4] font-semibold text-[#06201C]"
                  : "font-medium text-[#9AA4B5] hover:text-[#E6E9EF]")
              }
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Transcript diff
            </button>
          </div>
          <span className="omni-mono text-[11px] text-[#5E6675]">
            {target === "summary"
              ? "structured note · section by section"
              : "diarized transcript · corrected attributions"}
          </span>
        </div>

        <div className="omni-scroll min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-4">
            {/* Change summary — what changed, in plain language */}
            <Panel
              title={`What changed in the ${target}`}
              subtitle="Summary of the corrections in this revision"
              right={
                <Badge tone="outline">
                  <span className="omni-mono text-[10px]">
                    {stats.additions + stats.removals} edits
                  </span>
                </Badge>
              }
              bodyClassName="p-4"
            >
              <ul className="flex flex-col gap-2">
                {changes.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#C2C8D2]"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5EEAD4]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* The diff itself */}
            {mode === "diff" ? (
              <Panel
                title={target === "summary" ? "Summary diff" : "Transcript diff"}
                subtitle="Side-by-side comparison"
                right={
                  <Badge tone="outline">
                    <span className="omni-mono text-[10px]">V1 → V2</span>
                  </Badge>
                }
                bodyClassName="p-3"
              >
                <DiffTable pairs={pairs} />
              </Panel>
            ) : (
              <Panel
                title={target === "summary" ? "Summary · V1" : "Transcript · V1"}
                subtitle="Original version before corrections"
                right={
                  <Badge tone="outline">
                    <span className="omni-mono text-[10px]">V1</span>
                  </Badge>
                }
                bodyClassName="p-4"
              >
                <div className="flex flex-col gap-1.5">
                  {pairs.map((pair, i) =>
                    pair.heading ? (
                      <div key={i} className="pb-1 pt-3 first:pt-0">
                        <SectionLabel>{pair.heading}</SectionLabel>
                      </div>
                    ) : pair.left ? (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#9AA4B5]"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E6675]" />
                        <span>{pair.left.text}</span>
                      </div>
                    ) : null,
                  )}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
