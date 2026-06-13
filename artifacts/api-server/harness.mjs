#!/usr/bin/env node
// Standalone harness for the OMNICON regeneration engine.
//
// Exercises the full loop end-to-end against the seed fixtures, without any
// OMNICON UI:
//   1. GET  /api/regenerate/seed   -> load the canonical V1 transcript/summary
//                                      + sample feedback + available models
//   2. POST /api/regenerate        -> call the real LLM, get V2 + diffs + obs
//
// Usage:
//   node harness.mjs [model]
//
// Env:
//   PORT      port the API server listens on (default 8080)
//   BASE_URL  full base url override (default http://localhost:$PORT)

const PORT = process.env.PORT || "8080";
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;
const API = `${BASE}/api`;

function hr(label) {
  console.log(`\n${"=".repeat(72)}\n${label}\n${"=".repeat(72)}`);
}

async function main() {
  const modelArg = process.argv[2];

  hr("1) Loading seed fixtures");
  const seedRes = await fetch(`${API}/regenerate/seed`);
  if (!seedRes.ok) {
    throw new Error(`seed fetch failed: ${seedRes.status} ${await seedRes.text()}`);
  }
  const seed = await seedRes.json();
  const model = modelArg || seed.defaultModel;
  console.log(`Meeting:      ${seed.meetingTitle} (${seed.date})`);
  console.log(`Participants: ${seed.participants.join(", ")}`);
  console.log(`Transcript:   ${seed.v1Transcript.length} chars`);
  console.log(`Summary:      ${seed.v1Summary.length} chars`);
  console.log(`Feedback:     ${seed.feedback.length} chars`);
  console.log(`Models:       ${seed.models.map((m) => m.id).join(", ")}`);
  console.log(`Using model:  ${model}`);

  hr("2) Calling regeneration endpoint (real LLM)");
  const t0 = Date.now();
  const res = await fetch(`${API}/regenerate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      v1Transcript: seed.v1Transcript,
      v1Summary: seed.v1Summary,
      feedback: seed.feedback,
      model,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Request failed (${res.status}):`, text);
    process.exit(1);
  }
  const data = JSON.parse(text);
  console.log(`Round-trip:   ${Date.now() - t0}ms`);

  const o = data.observability;
  hr("Observability");
  console.log(`Model:        ${o.model}`);
  console.log(`Input tokens: ${o.inputTokens}`);
  console.log(`Output tokens:${o.outputTokens}`);
  console.log(`Total tokens: ${o.totalTokens}`);
  console.log(`Latency:      ${o.latencyMs}ms`);
  console.log(
    `Est. cost:    ${o.estimatedCostUsd == null ? "n/a" : "$" + o.estimatedCostUsd.toFixed(6)}`,
  );
  console.log(`Finish:       ${o.finishReason}`);
  console.log(
    `Reasoning:    ${o.reasoning ? o.reasoning.slice(0, 400) + (o.reasoning.length > 400 ? "..." : "") : "(none exposed)"}`,
  );

  hr("Change explanation");
  console.log(data.changeExplanation);

  hr("Diff stats");
  console.log(
    `Transcript: +${data.transcriptDiffStats.added} -${data.transcriptDiffStats.removed} =${data.transcriptDiffStats.unchanged}`,
  );
  console.log(
    `Summary:    +${data.summaryDiffStats.added} -${data.summaryDiffStats.removed} =${data.summaryDiffStats.unchanged}`,
  );

  hr("Summary diff (V1 <-> V2)");
  for (const seg of data.summaryDiff) {
    const mark = seg.type === "add" ? "+" : seg.type === "remove" ? "-" : " ";
    console.log(`${mark} ${seg.value}`);
  }

  hr("V2 Summary");
  console.log(data.v2Summary);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Harness error:", err);
  process.exit(1);
});
