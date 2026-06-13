import { Router, type IRouter } from "express";
import { RegenerateBody, RegenerateResponse } from "@workspace/api-zod";
import { seedFixture } from "../seed";
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL,
  isKnownModel,
} from "../lib/models";
import {
  computeLineDiff,
  computeWordDiff,
  diffStats,
  wordDiffStats,
} from "../lib/diff";
import { RegenerationError } from "../lib/regenerate";
import { runPipeline, defaultPipelineConfig } from "../lib/guardrails/pipeline";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/regenerate/seed", (_req, res) => {
  res.json({
    meetingTitle: seedFixture.meetingTitle,
    date: seedFixture.date,
    participants: seedFixture.participants,
    v1Transcript: seedFixture.v1Transcript,
    v1Summary: seedFixture.v1Summary,
    feedback: seedFixture.feedback,
    models: AVAILABLE_MODELS,
    defaultModel: DEFAULT_MODEL,
  });
});

router.get("/regenerate/models", (_req, res) => {
  res.json({ models: AVAILABLE_MODELS, defaultModel: DEFAULT_MODEL });
});

router.post("/regenerate", async (req, res) => {
  const parsed = RegenerateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: `Invalid request: ${parsed.error.issues
        .map((i) => `${i.path.join(".")} ${i.message}`)
        .join("; ")}`,
      retryable: false,
    });
    return;
  }

  const body = parsed.data;

  if (!isKnownModel(body.model)) {
    res.status(400).json({
      error: `Unknown model "${body.model}". Available: ${AVAILABLE_MODELS.map(
        (m) => m.id,
      ).join(", ")}`,
      retryable: false,
    });
    return;
  }

  try {
    const pipelineResult = await runPipeline(
      {
        v1Transcript: body.v1Transcript,
        v1Summary: body.v1Summary,
        feedback: body.feedback,
        flaggedSegments: body.flaggedSegments,
        model: body.model,
      },
      defaultPipelineConfig,
    );

    if (pipelineResult.blocked || pipelineResult.output === null) {
      res.status(422).json({
        error: pipelineResult.blockReason ?? "Request blocked by guardrail pipeline.",
        retryable: false,
      });
      return;
    }

    const result = pipelineResult.output;

    const transcriptDiff = computeLineDiff(
      body.v1Transcript,
      result.v2Transcript,
    );
    const summaryDiff = computeLineDiff(body.v1Summary, result.v2Summary);
    const transcriptWordDiff = computeWordDiff(
      body.v1Transcript,
      result.v2Transcript,
    );
    const summaryWordDiff = computeWordDiff(body.v1Summary, result.v2Summary);

    const payload = {
      v2Transcript: result.v2Transcript,
      v2Summary: result.v2Summary,
      changeExplanation: result.changeExplanation,
      transcriptDiff,
      summaryDiff,
      transcriptWordDiff,
      summaryWordDiff,
      transcriptDiffStats: diffStats(transcriptDiff),
      summaryDiffStats: diffStats(summaryDiff),
      transcriptWordDiffStats: wordDiffStats(transcriptWordDiff),
      summaryWordDiffStats: wordDiffStats(summaryWordDiff),
      observability: result.observability,
    };

    const validated = RegenerateResponse.parse(payload);
    res.json(validated);
  } catch (err) {
    if (err instanceof RegenerationError) {
      logger.error({ err: err.message }, "Regeneration failed");
      res.status(502).json({ error: err.message, retryable: err.retryable });
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message }, "Unexpected regeneration error");
    res.status(502).json({
      error: `Unexpected error: ${message}`,
      retryable: true,
    });
  }
});

export default router;
