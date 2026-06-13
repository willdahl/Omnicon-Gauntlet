import {
  AppFrame,
  Badge,
  Button,
  SectionLabel,
} from "./ui";
import { SOURCES } from "./mockData";
import type { SourceOption } from "./mockData";
import {
  AudioLines,
  Waves,
  Flame,
  Upload,
  Check,
  ArrowRight,
  RefreshCw,
  FolderSearch,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  granola: AudioLines,
  otter: Waves,
  fireflies: Flame,
  upload: Upload,
};

function SourceCard({ source }: { source: SourceOption }) {
  const Icon = ICONS[source.id] ?? AudioLines;
  const active = source.connected;

  if (active) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-[#5EEAD4] bg-[#12161F] shadow-[0_0_0_1px_rgba(94,234,212,0.25),0_0_40px_-12px_rgba(94,234,212,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#5EEAD4]/10 via-transparent to-transparent" />
        <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border border-[#5EEAD4] bg-[#5EEAD4] text-[#06201C]">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>

        <div className="relative p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#0F766E] bg-[#0F766E]/20 text-[#5EEAD4]">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 pr-8">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-[#E6E9EF]">
                  {source.name}
                </h3>
                {source.primary && <Badge tone="outline">Primary</Badge>}
              </div>
              <p className="mt-1 omni-mono text-[11px] text-[#9AA4B5]">
                {source.tagline}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge tone="accent">
              <span className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
              Connected
            </Badge>
            <Badge tone="neutral">
              <RefreshCw className="h-3 w-3" />
              <span className="omni-mono text-[10px]">Synced {source.lastSync}</span>
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#232A38] bg-[#0F766E]/10 px-3 py-2.5">
              <div className="flex items-center gap-1.5 omni-mono text-[10px] uppercase tracking-[0.16em] text-[#5E6675]">
                <FolderSearch className="h-3 w-3" />
                Indexed
              </div>
              <div className="mt-1 omni-mono text-[16px] font-semibold text-[#E6E9EF]">
                {source.meetingCount}{" "}
                <span className="text-[11px] font-normal text-[#9AA4B5]">
                  conversations
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-[#232A38] bg-[#171C28] px-3 py-2.5">
              <div className="omni-mono text-[10px] uppercase tracking-[0.16em] text-[#5E6675]">
                Last sync
              </div>
              <div className="mt-1 omni-mono text-[16px] font-semibold text-[#E6E9EF]">
                {source.lastSync}
              </div>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-[#9AA4B5]">
            {source.note}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#232A38] bg-[#12161F]/60 p-5 transition-colors hover:border-[#2E3749]">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#232A38] bg-[#171C28] text-[#5E6675]">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#9AA4B5]">
              {source.name}
            </h3>
            <Badge tone="outline">Not connected</Badge>
          </div>
          <p className="mt-1 omni-mono text-[11px] text-[#5E6675]">
            {source.tagline}
          </p>
        </div>
      </div>

      <p className="mt-4 flex-1 text-[12px] leading-relaxed text-[#5E6675]">
        {source.note}
      </p>

      <div className="mt-4">
        <Button variant="secondary" size="sm">
          Connect
        </Button>
      </div>
    </div>
  );
}

export function SourcePicker({
  onContinue,
  onStepClick,
}: {
  onContinue: () => void;
  onStepClick?: (step: number) => void;
}) {
  return (
    <AppFrame
      step={1}
      title="Connect a source"
      subtitle="Choose where meeting transcripts come from. OMNICON pulls conversations from your connected tool, then routes them through the review pipeline."
      onStepClick={onStepClick}
      headerRight={
        <Badge tone="green">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
          1 source connected
        </Badge>
      }
      footer={
        <>
          <div className="flex items-center gap-2.5">
            <span className="omni-mono text-[11px] uppercase tracking-[0.16em] text-[#5E6675]">
              Source
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-[#232A38] bg-[#12161F] px-3 py-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#5EEAD4] shadow-[0_0_8px_rgba(94,234,212,0.8)]" />
              <span className="text-[13px] font-semibold text-[#E6E9EF]">
                Granola
              </span>
            </span>
          </div>
          <Button variant="primary" onClick={onContinue}>
            Continue to conversations
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="mx-auto max-w-5xl">
        <SectionLabel>Available sources</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          {SOURCES.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
