const express = require("express");
const router = express.Router();
const { addCodeJob } = require("../jobs/queue");
const codeQueueEvents = require("../jobs/queueEvents");

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout waiting for job result")), ms)
    ),
  ]);
}

router.post("/runn", async (req, res) => {
  const { code, input, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Missing code or language" });
  }

  try {
    const job = await addCodeJob({ code, input, language });

    // Instead of waiting for the result, immediately respond with jobId
    res.json({ jobId: job.id });
  } catch (err) {
    res.status(500).json({
      error: "Failed to enqueue job",
      details: err.message,
    });
  }
});

module.exports = router;
