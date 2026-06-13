import { Router, type IRouter } from "express";
import { runTestSuite, type TestCaseResult } from "../lib/guardrails/run-tests";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Explicit opt-in: the endpoint is disabled unless DEMO_MODE=true is set.
// This prevents accidental cost exposure in non-demo deployments.
const DEMO_MODE = process.env.DEMO_MODE === "true";

router.post("/guardrails/run-tests", async (req, res) => {
  if (!DEMO_MODE) {
    res.status(403).json({ error: "Test suite is only available in demo mode." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("start", { total: 8 });

  const results: TestCaseResult[] = [];

  try {
    await runTestSuite((partial) => {
      sendEvent("progress", partial);
      if (partial.status !== "running") {
        results.push(partial);
      }
    });

    const passed = results.filter((r) => r.status === "pass").length;
    const failed = results.filter((r) => r.status === "fail").length;

    sendEvent("complete", {
      results,
      summary: { total: results.length, passed, failed },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message }, "Guardrail test suite failed");
    sendEvent("error", { message });
  }

  res.end();
});

export default router;
