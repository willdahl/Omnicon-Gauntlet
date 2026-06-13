import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  useGetRegenerateSeed,
  useRegenerate,
  type RegenerateResult,
} from "@workspace/api-client-react";
import { SourcePicker } from "./omnicon/SourcePicker";
import { ConversationPicker } from "./omnicon/ConversationPicker";
import { ModelPicker } from "./omnicon/ModelPicker";
import { ReviewWorkspace } from "./omnicon/ReviewWorkspace";
import { DiffReview } from "./omnicon/DiffReview";
import { OutputObservability } from "./omnicon/OutputObservability";
import { CONTEXT_ADVISORY } from "./omnicon/mockData";
import {
  parseSummarySections,
  parseTranscriptSegments,
  flatDiffToPairs,
  explanationToBullets,
  observabilityToMetrics,
  modelsToGroups,
  seedToMeeting,
  wordCount,
  mapStats,
} from "./omnicon/adapters";

function StatusScreen({
  title,
  subtitle,
  variant,
  onRetry,
}: {
  title: string;
  subtitle?: string;
  variant: "loading" | "error";
  onRetry?: () => void;
}) {
  return (
    <div className="omni-root flex h-screen flex-col items-center justify-center gap-4 bg-[#0B0E14] px-6 text-center text-[#E6E9EF]">
      {variant === "loading" ? (
        <Loader2 className="h-8 w-8 animate-spin text-[#5EEAD4]" />
      ) : (
        <AlertTriangle className="h-8 w-8 text-[#F87171]" />
      )}
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-[#9AA4B5]">
            {subtitle}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-[#2E3749] bg-[#171C28] px-4 py-2 text-[13px] text-[#E6E9EF] transition-colors hover:bg-[#1C2230]"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// Translate a failed regeneration into a clear, actionable message. The Replit
// proxy caps requests at ~120s, so slow models (e.g. Claude Sonnet) on a long
// transcript get their connection killed and the proxy returns a 502 HTML page.
// We surface that as guidance rather than dumping raw markup into the UI.
function describeRegenError(error: unknown, modelName: string): string {
  const err = error as { status?: number; data?: unknown; message?: string };
  const status = err?.status;
  const msg = err?.message ?? "";

  const dataErr =
    err?.data && typeof err.data === "object"
      ? (err.data as { error?: string }).error
      : undefined;

  const timedOut =
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /bad gateway|gateway time-?out|couldn.?t reach this app/i.test(msg);

  if (timedOut) {
    return `${modelName} took longer than the request limit (~2 minutes) and the connection timed out before it finished. Try a faster model such as Gemini 3.5 Flash, or shorten the transcript.`;
  }

  if (dataErr) return dataErr;

  if (/failed to fetch|networkerror|load failed|aborted/i.test(msg)) {
    return `The request didn't complete — this usually means ${modelName} took longer than the ~2-minute limit. Try a faster model such as Gemini 3.5 Flash.`;
  }

  return msg || "Generation failed. Please try again.";
}

function App() {
  const seedQuery = useGetRegenerateSeed();
  const regen = useRegenerate();
  const seed = seedQuery.data;

  const [stage, setStage] = useState(1);
  const [modelId, setModelId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<RegenerateResult | null>(null);

  // Seed defaults (model + feedback) once the fixture loads.
  useEffect(() => {
    if (!seed) return;
    setModelId((cur) => cur ?? seed.defaultModel);
    setFeedback((cur) => cur ?? seed.feedback);
  }, [seed]);

  // ---- Derived view models (hooks must run unconditionally) ----------------
  const groups = useMemo(
    () => (seed ? modelsToGroups(seed.models, seed.defaultModel) : []),
    [seed],
  );
  const meeting = useMemo(() => (seed ? seedToMeeting(seed) : null), [seed]);
  const v1Sections = useMemo(
    () => (seed ? parseSummarySections(seed.v1Summary) : []),
    [seed],
  );
  const v1Segments = useMemo(
    () => (seed ? parseTranscriptSegments(seed.v1Transcript) : []),
    [seed],
  );
  const derived = useMemo(
    () =>
      result
        ? {
            summaryPairs: flatDiffToPairs(result.summaryDiff),
            transcriptPairs: flatDiffToPairs(result.transcriptDiff),
            summaryStats: mapStats(result.summaryDiffStats),
            transcriptStats: mapStats(result.transcriptDiffStats),
            changes: explanationToBullets(result.changeExplanation),
            v2Sections: parseSummarySections(result.v2Summary),
            v2Segments: parseTranscriptSegments(result.v2Transcript),
          }
        : null,
    [result],
  );

  // ---- Loading / error gates -----------------------------------------------
  if (seedQuery.isError) {
    return (
      <StatusScreen
        variant="error"
        title="Couldn't load the meeting"
        subtitle={
          (seedQuery.error as Error)?.message ??
          "The regeneration engine did not respond."
        }
        onRetry={() => seedQuery.refetch()}
      />
    );
  }
  if (!seed || !meeting) {
    return <StatusScreen variant="loading" title="Loading meeting…" />;
  }

  const allModels = groups.flatMap((g) => g.models);
  const effModelId = modelId ?? seed.defaultModel;
  const model = allModels.find((m) => m.id === effModelId) ?? allModels[0];
  const effFeedback = feedback ?? seed.feedback;

  const onStepClick = (step: number) => {
    if (step <= stage) setStage(step);
  };

  const reset = () => {
    setStage(1);
    setModelId(seed.defaultModel);
    setFeedback(seed.feedback);
    setResult(null);
    regen.reset();
  };

  const handleGenerate = () => {
    regen.mutate(
      {
        data: {
          v1Transcript: seed.v1Transcript,
          v1Summary: seed.v1Summary,
          feedback: effFeedback,
          model: effModelId,
        },
      },
      {
        onSuccess: (res) => {
          setResult(res);
          setStage(5);
        },
      },
    );
  };

  // Generation in flight — can take a while for larger models.
  if (regen.isPending) {
    return (
      <StatusScreen
        variant="loading"
        title="Generating V2…"
        subtitle={`${model.name} is reviewing the transcript and regenerating the summary from your feedback. This can take up to a couple of minutes.`}
      />
    );
  }

  // Guard: diff/output stages require a result.
  if ((stage === 5 || stage === 6) && !derived) {
    setStage(4);
    return <StatusScreen variant="loading" title="Preparing review…" />;
  }

  switch (stage) {
    case 1:
      return (
        <SourcePicker
          onContinue={() => setStage(2)}
          onStepClick={onStepClick}
        />
      );
    case 2:
      return (
        <ConversationPicker
          meetings={[meeting]}
          selectedId={meeting.id}
          onSelect={() => {}}
          onContinue={() => setStage(3)}
          onStepClick={onStepClick}
        />
      );
    case 3:
      return (
        <ModelPicker
          groups={groups}
          advisory={CONTEXT_ADVISORY}
          selectedId={effModelId}
          onSelect={setModelId}
          onContinue={() => setStage(4)}
          onStepClick={onStepClick}
        />
      );
    case 4:
      return (
        <ReviewWorkspace
          meetingTitle={seed.meetingTitle}
          modelName={model.name}
          wordCount={wordCount(seed.v1Transcript)}
          transcript={v1Segments}
          summary={v1Sections}
          feedback={effFeedback}
          onFeedbackChange={setFeedback}
          onGenerate={handleGenerate}
          generateError={
            regen.isError ? describeRegenError(regen.error, model.name) : null
          }
          onStepClick={onStepClick}
        />
      );
    case 5:
      return (
        <DiffReview
          summaryPairs={derived!.summaryPairs}
          transcriptPairs={derived!.transcriptPairs}
          summaryStats={derived!.summaryStats}
          transcriptStats={derived!.transcriptStats}
          changes={derived!.changes}
          onApprove={() => setStage(6)}
          onReject={() => setStage(4)}
          onStepClick={onStepClick}
        />
      );
    case 6:
      return (
        <OutputObservability
          summary={derived!.v2Sections}
          transcript={derived!.v2Segments}
          metrics={observabilityToMetrics(
            result!.observability,
            model.name,
            model.provider,
          )}
          runMeta={{
            model: result!.observability.model,
            finishReason: result!.observability.finishReason,
            totalTokens: result!.observability.totalTokens,
            reasoning: result!.observability.reasoning,
          }}
          meetingTitle={seed.meetingTitle}
          feedback={effFeedback}
          changes={derived!.changes}
          summaryStats={derived!.summaryStats}
          transcriptStats={derived!.transcriptStats}
          onStartNew={reset}
          onStepClick={onStepClick}
        />
      );
    default:
      return null;
  }
}

export default App;
