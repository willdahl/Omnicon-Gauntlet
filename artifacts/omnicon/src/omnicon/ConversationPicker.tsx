import { Search, Check, ArrowRight } from "lucide-react";
import { AppFrame, Panel, Badge, Button, Avatar } from "./ui";
import type { MeetingSummaryItem } from "./mockData";
import { initialsOf } from "./adapters";

export function ConversationPicker({
  meetings,
  selectedId,
  onSelect,
  onContinue,
  onStepClick,
}: {
  meetings: MeetingSummaryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onStepClick?: (step: number) => void;
}) {
  const selected = meetings.find((m) => m.id === selectedId);

  const headerRight = (
    <>
      <Badge tone="accent">
        <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
        Granola
      </Badge>
      <div className="flex items-center gap-2 rounded-lg border border-[#2E3749] bg-[#171C28] px-3 py-2">
        <Search className="h-4 w-4 text-[#5E6675]" />
        <input
          disabled
          placeholder="Filter conversations…"
          className="w-52 bg-transparent text-[13px] text-[#E6E9EF] placeholder:text-[#5E6675] focus:outline-none"
        />
      </div>
    </>
  );

  const footer = (
    <>
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[#5E6675]">Selected:</span>
        <span className="font-medium text-[#E6E9EF]">
          {selected?.title ?? "—"}
        </span>
      </div>
      <Button variant="primary" onClick={onContinue}>
        Continue to model
        <ArrowRight className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <AppFrame
      step={2}
      title="Choose a conversation"
      subtitle="Pick a meeting from your Granola cache to summarize and review."
      headerRight={headerRight}
      footer={footer}
      onStepClick={onStepClick}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="omni-mono text-[10px] uppercase tracking-[0.18em] text-[#5E6675]">
            {meetings.length} conversation{meetings.length === 1 ? "" : "s"} ·
            cache-v3.json
          </div>
          <div className="omni-mono text-[10px] uppercase tracking-[0.18em] text-[#5E6675]">
            synced just now
          </div>
        </div>

        <Panel padded={false}>
          <div className="divide-y divide-[#1B212D]">
            {meetings.map((m) => {
              const isSel = m.id === selectedId;
              const shown = m.attendees.slice(0, 4);
              const extra = m.attendees.length - shown.length;
              const meta = [
                m.date,
                m.platform,
                `${m.segmentCount} segments`,
                `${m.wordCount.toLocaleString()} words`,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m.id)}
                  className={[
                    "group relative flex w-full gap-4 px-5 py-4 text-left transition-colors",
                    isSel ? "bg-[#0F766E]/[0.08]" : "hover:bg-[#171C28]/60",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "absolute inset-y-0 left-0 w-[3px]",
                      isSel ? "bg-[#5EEAD4]" : "bg-transparent",
                    ].join(" ")}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[15px] font-semibold text-[#E6E9EF]">
                        {m.title}
                      </h3>
                      <span className="text-[12px] text-[#9AA4B5]">
                        {m.platform}
                      </span>
                    </div>

                    <div className="omni-mono mt-1.5 text-[11px] text-[#5E6675]">
                      {meta}
                    </div>

                    <p className="mt-2 max-w-2xl truncate text-[13px] text-[#9AA4B5]">
                      {m.preview}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end justify-between">
                    <div className="grid h-5 w-5 place-items-center">
                      {isSel ? (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#5EEAD4] text-[#06201C]">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-[#2E3749] transition-colors group-hover:border-[#5E6675]" />
                      )}
                    </div>

                    <div className="flex items-center -space-x-2">
                      {shown.map((a) => (
                        <Avatar
                          key={a}
                          initials={initialsOf(a)}
                          className="ring-2 ring-[#12161F]"
                        />
                      ))}
                      {extra > 0 && (
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#2E3749] bg-[#1C2230] omni-mono text-[10px] font-semibold text-[#9AA4B5] ring-2 ring-[#12161F]">
                          +{extra}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>
    </AppFrame>
  );
}
