import { CheckCircle, Download, Copy, RotateCcw } from "lucide-react";
import { AppFrame, Panel, Badge, Button, Stat, Avatar } from "./ui";
import {
  SUMMARY_V2,
  TRANSCRIPT,
  RUN_OBSERVABILITY,
  RUN_META,
  type ObsMetric,
} from "./mockData";

export function OutputObservability({
  modelName,
  modelProvider,
  onStartNew,
  onStepClick,
}: {
  modelName: string;
  modelProvider: string;
  onStartNew: () => void;
  onStepClick?: (step: number) => void;
}) {
  const metrics: ObsMetric[] = RUN_OBSERVABILITY.map((m) =>
    m.label === "Model"
      ? { ...m, value: modelName, sub: modelProvider.toLowerCase() }
      : m,
  );

  return (
    <AppFrame
      step={6}
      title="Approved output"
      subtitle="V2 summary written back. Run telemetry below."
      onStepClick={onStepClick}
      headerRight={
        <Badge tone="green">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      }
      footer={
        <>
          <div className="flex items-center gap-2">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="ghost">
              <Copy className="h-4 w-4" />
              Copy summary
            </Button>
          </div>
          <Button variant="primary" onClick={onStartNew}>
            <RotateCcw className="h-4 w-4" />
            Start new review
          </Button>
        </>
      }
    >
      <div className="flex h-full flex-col gap-5">
        {/* 1. Observability row */}
        <div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
            {metrics.map((m) => (
              <Stat key={m.label} label={m.label} value={m.value} sub={m.sub} />
            ))}
          </div>
          <div className="omni-mono mt-2.5 text-[11px] text-[#5E6675]">
            run {RUN_META.runId} · started {RUN_META.startedAt} · finish_reason=
            {RUN_META.finishReason} · temp={RUN_META.temperature}
          </div>
        </div>

        {/* 2. Two-column artifact area */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
          {/* LEFT — Summary V2 */}
          <Panel
            title="Summary · V2"
            subtitle="Final approved artifact written back to source"
            right={<Badge tone="accent">Final</Badge>}
            className="lg:col-span-3"
            bodyClassName="omni-scroll overflow-y-auto"
          >
            <div className="space-y-6">
              {SUMMARY_V2.map((section) => (
                <div key={section.heading}>
                  <h3 className="text-[14px] font-semibold tracking-tight text-[#E6E9EF]">
                    {section.heading}
                  </h3>
                  <ul className="mt-2.5 space-y-2">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-[#9AA4B5]">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F766E]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>

          {/* RIGHT — Transcript */}
          <Panel
            title="Transcript"
            subtitle="Source of record"
            right={
              <span className="omni-mono text-[11px] text-[#5E6675]">
                {TRANSCRIPT.length} segments
              </span>
            }
            className="lg:col-span-2"
            bodyClassName="omni-scroll overflow-y-auto"
            padded={false}
          >
            <div className="divide-y divide-[#161B25]">
              {TRANSCRIPT.map((seg) => (
                <div key={seg.id} className="flex gap-2.5 px-4 py-2.5">
                  <Avatar initials={seg.initials} />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-medium text-[#E6E9EF]">
                        {seg.speaker}
                      </span>
                      <span className="omni-mono text-[10px] text-[#5E6675]">{seg.t}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-[#9AA4B5]">
                      {seg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}
