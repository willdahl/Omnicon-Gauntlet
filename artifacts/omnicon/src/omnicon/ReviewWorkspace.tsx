import { useState } from "react";
import { AppFrame, Panel, Badge, Button, Avatar, SectionLabel } from "./ui";
import type { TranscriptSegment, SummarySection } from "./mockData";
import { AlertTriangle, Sparkles } from "lucide-react";

export function ReviewWorkspace({
  meetingTitle,
  modelName,
  wordCount,
  transcript,
  summary,
  feedback,
  onFeedbackChange,
  onGenerate,
  generateError,
  onStepClick,
}: {
  meetingTitle: string;
  modelName: string;
  wordCount: number;
  transcript: TranscriptSegment[];
  summary: SummarySection[];
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onGenerate: () => void;
  generateError?: string | null;
  onStepClick?: (step: number) => void;
}) {
  const [view, setView] = useState<"transcript" | "summary">("summary");
  return (
    <AppFrame
      step={4}
      title="Review"
      subtitle="Read the AI-generated summary and type feedback as you go. The transcript is available to reference as well."
      onStepClick={onStepClick}
      headerRight={
        <>
          <Badge tone="neutral">Granola</Badge>
          <Badge tone="neutral">{meetingTitle}</Badge>
          <Badge tone="accent">{modelName}</Badge>
        </>
      }
      footer={
        <span className="omni-mono text-[11px] text-[#5E6675]">
          V1 source · {wordCount.toLocaleString()} words
        </span>
      }
    >
      <div className="flex h-full min-h-0 gap-4">
        {/* LEFT — transcript / summary */}
        <Panel
          className="min-h-0 w-[58%]"
          bodyClassName="flex min-h-0 flex-col p-0"
        >
          {/* Segmented toggle */}
          <div className="shrink-0 border-b border-[#1B212D] px-4 py-3">
            <div className="inline-flex rounded-lg border border-[#2E3749] bg-[#0A0D13] p-1">
              <button
                onClick={() => setView("summary")}
                className={
                  "rounded-md px-4 py-1.5 text-[12px] transition-colors " +
                  (view === "summary"
                    ? "bg-[#5EEAD4] font-semibold text-[#06201C]"
                    : "font-medium text-[#9AA4B5] hover:text-[#E6E9EF]")
                }
              >
                Summary
              </button>
              <button
                onClick={() => setView("transcript")}
                className={
                  "rounded-md px-4 py-1.5 text-[12px] transition-colors " +
                  (view === "transcript"
                    ? "bg-[#5EEAD4] font-semibold text-[#06201C]"
                    : "font-medium text-[#9AA4B5] hover:text-[#E6E9EF]")
                }
              >
                Transcript
              </button>
            </div>
          </div>

          {/* Transcript list */}
          <div className="omni-scroll min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div
              className={
                "flex flex-col gap-3 " + (view === "transcript" ? "" : "hidden")
              }
            >
              {transcript.map((seg) => (
                <div
                  key={seg.id}
                  className={
                    "rounded-lg border bg-[#12161F] p-3 " +
                    (seg.flagged
                      ? "border-[#232A38] border-l-2 border-l-[#FBBF24]"
                      : "border-[#1B212D]")
                  }
                >
                  <div className="flex items-start gap-3">
                    <Avatar initials={seg.initials} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#E6E9EF]">
                          {seg.speaker}
                        </span>
                        {seg.t && (
                          <span className="omni-mono text-[11px] text-[#5E6675]">
                            {seg.t}
                          </span>
                        )}
                        {seg.flagged && (
                          <Badge tone="amber">
                            <AlertTriangle className="h-3 w-3" />
                            Needs review
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#9AA4B5]">
                        {seg.text}
                      </p>
                      {seg.flagged && seg.flagReason && (
                        <p className="mt-1.5 text-[11px] text-[#FBBF24]">
                          {seg.flagReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary view (V1) */}
            <div
              className={
                "flex flex-col gap-5 " + (view === "summary" ? "" : "hidden")
              }
            >
              {summary.map((section) => (
                <div key={section.heading}>
                  <SectionLabel>{section.heading}</SectionLabel>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {section.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#9AA4B5]"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5EEAD4]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* RIGHT — feedback */}
        <Panel
          title="Your feedback"
          className="min-h-0 w-[42%]"
          bodyClassName="flex min-h-0 flex-col p-4"
        >
          <p className="text-[12px] leading-relaxed text-[#9AA4B5]">
            Describe the corrections OMNICON should apply when regenerating the
            summary.
          </p>

          <textarea
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            className="omni-scroll mt-3 min-h-[160px] flex-1 w-full resize-none rounded-lg border border-[#2E3749] bg-[#0A0D13] p-3 text-[13px] leading-relaxed text-[#E6E9EF] outline-none focus:border-[#0F766E]"
          />

          {generateError && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[#7F1D1D] bg-[#7F1D1D]/15 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F87171]" />
              <p className="text-[12px] leading-relaxed text-[#F87171]">
                {generateError}
              </p>
            </div>
          )}

          <div className="mt-auto pt-4">
            <Button variant="primary" className="w-full" onClick={onGenerate}>
              <Sparkles className="h-4 w-4" />
              Generate V2
            </Button>
          </div>
        </Panel>
      </div>
    </AppFrame>
  );
}
