import { useState } from "react";
import { SourcePicker } from "./omnicon/SourcePicker";
import { ConversationPicker } from "./omnicon/ConversationPicker";
import { ModelPicker } from "./omnicon/ModelPicker";
import { ReviewWorkspace } from "./omnicon/ReviewWorkspace";
import { DiffReview } from "./omnicon/DiffReview";
import { OutputObservability } from "./omnicon/OutputObservability";
import {
  MEETINGS,
  MODEL_GROUPS,
  DEFAULT_MODEL_ID,
  REVIEWER_FEEDBACK,
} from "./omnicon/mockData";

const ALL_MODELS = MODEL_GROUPS.flatMap((g) => g.models);
const DEFAULT_MEETING_ID =
  MEETINGS.find((m) => m.selected)?.id ?? MEETINGS[0].id;

function App() {
  const [stage, setStage] = useState(1);
  const [meetingId, setMeetingId] = useState(DEFAULT_MEETING_ID);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [feedback, setFeedback] = useState(REVIEWER_FEEDBACK);

  const meeting =
    MEETINGS.find((m) => m.id === meetingId) ?? MEETINGS[0];
  const model =
    ALL_MODELS.find((m) => m.id === modelId) ?? ALL_MODELS[0];

  // Allow jumping back to any already-completed step via the pipeline rail.
  const onStepClick = (step: number) => {
    if (step <= stage) setStage(step);
  };

  const reset = () => {
    setStage(1);
    setMeetingId(DEFAULT_MEETING_ID);
    setModelId(DEFAULT_MODEL_ID);
    setFeedback(REVIEWER_FEEDBACK);
  };

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
          selectedId={meetingId}
          onSelect={setMeetingId}
          onContinue={() => setStage(3)}
          onStepClick={onStepClick}
        />
      );
    case 3:
      return (
        <ModelPicker
          selectedId={modelId}
          onSelect={setModelId}
          onContinue={() => setStage(4)}
          onStepClick={onStepClick}
        />
      );
    case 4:
      return (
        <ReviewWorkspace
          meetingTitle={meeting.title}
          modelName={model.name}
          wordCount={meeting.wordCount}
          feedback={feedback}
          onFeedbackChange={setFeedback}
          onGenerate={() => setStage(5)}
          onStepClick={onStepClick}
        />
      );
    case 5:
      return (
        <DiffReview
          onApprove={() => setStage(6)}
          onReject={() => setStage(4)}
          onStepClick={onStepClick}
        />
      );
    case 6:
      return (
        <OutputObservability
          modelName={model.name}
          modelProvider={model.provider}
          onStartNew={reset}
          onStepClick={onStepClick}
        />
      );
    default:
      return null;
  }
}

export default App;
