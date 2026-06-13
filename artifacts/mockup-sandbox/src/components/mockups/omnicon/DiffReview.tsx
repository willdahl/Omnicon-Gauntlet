import { Plus, Minus, ChevronDown, Eye, X, Check } from "lucide-react";
import { AppFrame, Panel, Badge, Button } from "./_shared/ui";
import { SUMMARY_DIFF, TRANSCRIPT_DIFF, DIFF_STATS } from "./_shared/mockData";
import type { DiffLine } from "./_shared/mockData";

function DiffRow({ line }: { line: DiffLine }) {
  if (line.heading) {
    return (
      <div className="flex items-center gap-3 px-3 pb-2 pt-4 first:pt-1">
        <div className="omni-mono text-[10px] uppercase tracking-[0.18em] text-[#5E6675]">
          {line.text}
        </div>
        <div className="h-px flex-1 bg-[#1B212D]" />
      </div>
    );
  }

  if (line.op === "add") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-[#166534]/40 bg-[#166534]/10 px-3 py-1.5">
        <div className="omni-mono mt-0.5 flex w-4 shrink-0 items-center justify-center text-[13px] font-semibold text-[#4ADE80]">
          +
        </div>
        <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4ADE80]" />
        <p className="text-[13px] leading-relaxed text-[#4ADE80]">{line.text}</p>
      </div>
    );
  }

  if (line.op === "remove") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-[#7F1D1D]/40 bg-[#7F1D1D]/10 px-3 py-1.5">
        <div className="omni-mono mt-0.5 flex w-4 shrink-0 items-center justify-center text-[13px] font-semibold text-[#F87171]">
          −
        </div>
        <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F87171]" />
        <p className="text-[13px] leading-relaxed text-[#F87171]/85 line-through decoration-[#F87171]/40">
          {line.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-3 py-1.5">
      <div className="omni-mono mt-0.5 flex w-4 shrink-0 items-center justify-center text-[13px] text-[#3A4150]">
        ·
      </div>
      <div className="h-3.5 w-3.5 shrink-0" />
      <p className="text-[13px] leading-relaxed text-[#9AA4B5]">{line.text}</p>
    </div>
  );
}

export function DiffReview() {
  const transcriptChanges =
    TRANSCRIPT_DIFF.filter((l) => l.op !== "same" && !l.heading).length;

  return (
    <AppFrame
      step={5}
      title="Review changes"
      subtitle="V1 → V2 — confirm the corrections before approving."
      headerRight={
        <>
          <Badge tone="green">
            <span className="omni-mono">+{DIFF_STATS.additions}</span>
          </Badge>
          <Badge tone="red">
            <span className="omni-mono">−{DIFF_STATS.removals}</span>
          </Badge>
          <Badge tone="neutral">
            <span className="omni-mono">{DIFF_STATS.unchanged}</span> unchanged
          </Badge>
          <div className="ml-1 flex items-center rounded-lg border border-[#2E3749] bg-[#12161F] p-0.5">
            <span className="omni-mono rounded-md bg-[#1C2230] px-2.5 py-1 text-[11px] font-semibold text-[#E6E9EF]">
              Diff
            </span>
            <span className="omni-mono px-2.5 py-1 text-[11px] text-[#5E6675]">
              V1
            </span>
          </div>
          <Button variant="ghost" size="sm">
            <Eye className="h-3.5 w-3.5" />
            View V1
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
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Panel
          title="Summary diff"
          subtitle="Structured note — section by section"
          right={
            <Badge tone="outline">
              <span className="omni-mono text-[10px]">V1 → V2</span>
            </Badge>
          }
          bodyClassName="p-3"
        >
          <div className="flex flex-col gap-0.5">
            {SUMMARY_DIFF.map((line, i) => (
              <DiffRow key={i} line={line} />
            ))}
          </div>
        </Panel>

        <section className="overflow-hidden rounded-xl border border-[#232A38] bg-[#12161F]">
          <button
            type="button"
            className="flex w-full items-center justify-between border-b border-[#1B212D] px-4 py-3 text-left transition-colors hover:bg-[#171C28]"
          >
            <div className="flex items-center gap-2.5">
              <ChevronDown className="h-4 w-4 text-[#9AA4B5]" />
              <span className="text-[13px] font-semibold text-[#E6E9EF]">
                Transcript diff
              </span>
              <Badge tone="amber">
                <span className="omni-mono">{transcriptChanges}</span> changes
              </Badge>
            </div>
            <span className="omni-mono text-[10px] uppercase tracking-[0.16em] text-[#5E6675]">
              corrected attributions
            </span>
          </button>
          <div className="p-3">
            <div className="flex flex-col gap-0.5">
              {TRANSCRIPT_DIFF.map((line, i) => (
                <DiffRow key={i} line={line} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
