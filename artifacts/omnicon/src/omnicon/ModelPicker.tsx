import { ArrowRight, Check, Info } from "lucide-react";
import { AppFrame, Badge, Button, SectionLabel } from "./ui";
import type { ModelOption, ModelProviderGroup } from "./mockData";

function CostPips({ cost }: { cost: NonNullable<ModelOption["cost"]> }) {
  const filled = cost.length;
  return (
    <div className="flex items-center gap-1" title={cost}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            "h-1.5 w-1.5 rounded-full " +
            (n <= filled ? "bg-[#5EEAD4]" : "bg-[#2E3749]")
          }
        />
      ))}
    </div>
  );
}

function ModelCard({
  model,
  selected,
  onSelect,
}: {
  model: ModelOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors " +
        (selected
          ? "border-[#5EEAD4] bg-[#0F766E]/10"
          : "border-[#232A38] bg-[#12161F] hover:border-[#2E3749]")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {selected && (
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#5EEAD4] text-[#06201C]">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          )}
          <span className="text-[14px] font-semibold text-[#E6E9EF]">
            {model.name}
          </span>
        </div>
        {model.recommended && <Badge tone="accent">Default</Badge>}
      </div>

      {model.blurb && (
        <p className="text-[12px] leading-relaxed text-[#9AA4B5]">
          {model.blurb}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <Badge tone="outline">{model.id}</Badge>
          {model.context && <Badge tone="outline">{model.context} ctx</Badge>}
          {model.cost && <CostPips cost={model.cost} />}
        </div>
        {model.costLabel && (
          <span className="omni-mono text-[10px] text-[#5E6675]">
            {model.costLabel}
          </span>
        )}
      </div>
    </button>
  );
}

export function ModelPicker({
  groups,
  advisory,
  selectedId,
  onSelect,
  onContinue,
  onStepClick,
}: {
  groups: ModelProviderGroup[];
  advisory: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onStepClick?: (step: number) => void;
}) {
  const selected = groups
    .flatMap((g) => g.models)
    .find((m) => m.id === selectedId);

  return (
    <AppFrame
      step={3}
      title="Select a model"
      subtitle="Choose the LLM that will regenerate the meeting summary from the transcript and your review notes."
      onStepClick={onStepClick}
      footer={
        <>
          <div className="flex items-center gap-2 text-[12px] text-[#9AA4B5]">
            <span className="text-[#5E6675]">Model:</span>
            <span className="font-medium text-[#E6E9EF]">
              {selected?.name ?? "—"}
            </span>
            {selected?.recommended && <Badge tone="accent">Default</Badge>}
          </div>
          <Button variant="primary" onClick={onContinue}>
            Continue to review
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Advisory banner */}
        <div className="flex items-start gap-3 rounded-xl border border-[#0F766E]/50 bg-[#0F766E]/10 px-4 py-3">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#0F766E] bg-[#12161F] text-[#5EEAD4]">
            <Info className="h-3.5 w-3.5" />
          </span>
          <p className="text-[12px] leading-relaxed text-[#9AA4B5]">
            {advisory}
          </p>
        </div>

        {/* Provider groups */}
        {groups.map((group) => (
          <div key={group.provider}>
            <SectionLabel>{group.provider}</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              {group.models.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  selected={model.id === selectedId}
                  onSelect={() => onSelect(model.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppFrame>
  );
}
